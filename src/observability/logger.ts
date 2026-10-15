import * as Sentry from '@sentry/react-native';
import { crashlyticsLog, crashlyticsRecordError } from './firebase';

/**
 * App-wide logger. Every call goes to up to five places:
 *
 * 1. Metro console (only in development): `12:03:04.512 INFO  [Pokemon] ...`
 * 2. In-memory buffer with the last MAX_ENTRIES lines, shown by the in-app
 *    log viewer (Home → Debugging (Sentry)). Works without Sentry.
 * 3. Sentry breadcrumb: the trail of what happened before an error. It's
 *    attached to the next error sent to Sentry.
 * 4. Sentry Logs (info and above): searchable in sentry.io → Explore → Logs.
 * 5. Firebase Crashlytics log (info and above): the lines are attached to the
 *    next crash or non-fatal report (Crashlytics → issue → Logs tab).
 *
 * `error()` also sends the error to Sentry as an issue (captureException)
 * and to Crashlytics as a non-fatal error (recordError).
 *
 * Usage:
 *   const log = createLogger('Pokemon');
 *   log.info('Page loaded', { offset: 20, count: 20 });
 *   log.error('Could not load page', error, { offset });
 *
 * Never log secrets: keys like pin / password / token are redacted anyway.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogData = Record<string, unknown>;

export type LogEntry = {
  id: number;
  timestamp: number;
  level: LogLevel;
  scope: string;
  message: string;
  data?: LogData;
  /** Sentry event id when the entry was sent as an issue. */
  eventId?: string;
};

const MAX_ENTRIES = 300;

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

type LoggerOptions = {
  /** Lowest level printed to the console. */
  consoleLevel: LogLevel | 'off';
  /** Lowest level sent to Sentry Logs. */
  sentryLogLevel: LogLevel;
  /** Lowest level added to the Crashlytics log. */
  firebaseLogLevel: LogLevel;
};

const options: LoggerOptions = {
  consoleLevel: __DEV__ ? 'debug' : 'off',
  sentryLogLevel: 'info',
  firebaseLogLevel: 'info',
};

/** Change where logs go (e.g. silence the console in tests). */
export function configureLogger(changes: Partial<LoggerOptions>) {
  Object.assign(options, changes);
}

// ---------- Redaction ----------

const SECRET_KEY = /pin|password|passcode|secret|token|hash|salt|auth/i;

/** Replaces values whose key looks secret with "[redacted]". */
export function redact(data: LogData | undefined): LogData | undefined {
  if (!data) {
    return undefined;
  }
  const result: LogData = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = SECRET_KEY.test(key) ? '[redacted]' : value;
  }
  return result;
}

// ---------- In-memory buffer (for the log viewer) ----------

let entries: LogEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function push(entry: LogEntry) {
  entries =
    entries.length >= MAX_ENTRIES
      ? [...entries.slice(entries.length - MAX_ENTRIES + 1), entry]
      : [...entries, entry];
  listeners.forEach(listener => listener());
}

export function subscribeToLogs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLogEntries() {
  return entries;
}

export function clearLogEntries() {
  entries = [];
  listeners.forEach(listener => listener());
}

// ---------- Console ----------

/** "12:03:04.512 INFO  [Pokemon] Page loaded" */
function consoleLine(entry: LogEntry) {
  const time = new Date(entry.timestamp).toISOString().slice(11, 23);
  return `${time} ${entry.level.toUpperCase().padEnd(5)} [${entry.scope}] ${
    entry.message
  }`;
}

/**
 * Sentry turns every console.* call into a breadcrumb. The logger already
 * adds its own (with structured data), so sentry.ts drops console
 * breadcrumbs that look like logger lines to avoid duplicates.
 */
export function isLoggerConsoleLine(message: unknown) {
  return (
    typeof message === 'string' &&
    /^\d{2}:\d{2}:\d{2}\.\d{3} (DEBUG|INFO |WARN |ERROR) \[/.test(message)
  );
}

function printToConsole(entry: LogEntry, error?: unknown) {
  if (
    options.consoleLevel === 'off' ||
    LEVEL_ORDER[entry.level] < LEVEL_ORDER[options.consoleLevel]
  ) {
    return;
  }
  const args: unknown[] = [consoleLine(entry)];
  if (entry.data) {
    args.push(entry.data);
  }
  if (error !== undefined) {
    args.push(error);
  }
  if (entry.level === 'error') {
    console.error(...args);
  } else if (entry.level === 'warn') {
    console.warn(...args);
  } else {
    console.log(...args);
  }
}

// ---------- Sentry ----------

/** Sentry Logs attributes must be primitives. */
function toAttributes(scope: string, data?: LogData) {
  const attributes: Record<string, string | number | boolean> = { scope };
  for (const [key, value] of Object.entries(data ?? {})) {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      attributes[key] = value;
    } else if (value !== undefined) {
      try {
        attributes[key] = JSON.stringify(value);
      } catch {
        attributes[key] = String(value);
      }
    }
  }
  return attributes;
}

function sendToSentry(entry: LogEntry, error?: unknown) {
  Sentry.addBreadcrumb({
    category: entry.scope,
    message: entry.message,
    level: entry.level === 'warn' ? 'warning' : entry.level,
    data: entry.data,
  });

  if (LEVEL_ORDER[entry.level] >= LEVEL_ORDER[options.sentryLogLevel]) {
    // Sentry.logger only exists when `enableLogs` is on (SDK 7+).
    Sentry.logger?.[entry.level]?.(
      `[${entry.scope}] ${entry.message}`,
      toAttributes(entry.scope, entry.data),
    );
  }

  if (entry.level === 'error') {
    // Keep the original error (and its stack trace) when there is one.
    const exception =
      error instanceof Error
        ? error
        : new Error(
            error === undefined
              ? entry.message
              : `${entry.message}: ${String(error)}`,
          );
    return Sentry.captureException(exception, {
      tags: { scope: entry.scope },
      contexts: { log: { message: entry.message, ...entry.data } },
    });
  }
  return undefined;
}

// ---------- Firebase Crashlytics ----------

/** "INFO [Pokemon] Page loaded {"offset":20}" (data cut at 500 chars). */
function crashlyticsLine(entry: LogEntry) {
  let data = '';
  if (entry.data) {
    try {
      data = ` ${JSON.stringify(entry.data).slice(0, 500)}`;
    } catch {
      data = ' [data not serializable]';
    }
  }
  return `${entry.level.toUpperCase()} [${entry.scope}] ${entry.message}${data}`;
}

function sendToFirebase(entry: LogEntry, error?: unknown) {
  if (LEVEL_ORDER[entry.level] >= LEVEL_ORDER[options.firebaseLogLevel]) {
    crashlyticsLog(crashlyticsLine(entry));
  }
  if (entry.level === 'error') {
    const exception =
      error instanceof Error
        ? error
        : new Error(
            error === undefined
              ? entry.message
              : `${entry.message}: ${String(error)}`,
          );
    crashlyticsRecordError(exception, {
      scope: entry.scope,
      message: entry.message.slice(0, 1000),
      ...(entry.eventId ? { sentry_event_id: entry.eventId } : {}),
    });
  }
}

// ---------- Public API ----------

function write(
  level: LogLevel,
  scope: string,
  message: string,
  data?: LogData,
  error?: unknown,
) {
  // warn/info/debug don't create an issue, so the error is kept as text.
  const withError =
    error !== undefined && level !== 'error'
      ? { ...data, error: describeError(error) }
      : data;
  const entry: LogEntry = {
    id: nextId++,
    timestamp: Date.now(),
    level,
    scope,
    message,
    data: redact(withError),
  };
  printToConsole(entry, level === 'error' ? error : undefined);
  try {
    entry.eventId = sendToSentry(entry, error);
  } catch {
    // Logging must never break the app.
  }
  try {
    // After Sentry, so the Crashlytics report can link to the Sentry event.
    sendToFirebase(entry, error);
  } catch {
    // Same: never break the app.
  }
  push(entry);
  return entry.eventId;
}

/** Short, readable description of anything that was thrown. */
export function describeError(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

export type Logger = {
  debug(message: string, data?: LogData): void;
  info(message: string, data?: LogData): void;
  /** Something went wrong but it's expected / handled (offline, cancelled). */
  warn(message: string, data?: LogData, error?: unknown): void;
  /** Unexpected failure: also creates an issue in Sentry. Returns its id. */
  error(message: string, error?: unknown, data?: LogData): string | undefined;
  /** Starts a timer; call the returned function to log the duration. */
  time(message: string, data?: LogData): (extra?: LogData) => void;
};

/** A logger whose lines are tagged with `scope` (screen or module name). */
export function createLogger(scope: string): Logger {
  return {
    debug: (message, data) => {
      write('debug', scope, message, data);
    },
    info: (message, data) => {
      write('info', scope, message, data);
    },
    warn: (message, data, error) => {
      write('warn', scope, message, data, error);
    },
    error: (message, error, data) =>
      write('error', scope, message, data, error),
    time: (message, data) => {
      const start = Date.now();
      return extra => {
        write('debug', scope, message, {
          ...data,
          ...extra,
          durationMs: Date.now() - start,
        });
      };
    },
  };
}
