import {
  getAnalytics,
  logEvent,
  logScreenView,
} from '@react-native-firebase/analytics';
import {
  crash,
  getCrashlytics,
  log as crashlyticsLogLine,
  recordError,
  setAttribute,
  setAttributes,
} from '@react-native-firebase/crashlytics';

/**
 * Firebase Crashlytics + Analytics, next to Sentry.
 *
 * - Crashlytics: native and JS crashes, non-fatal errors (recordError) and a
 *   rolling buffer of log lines that is attached to the next report.
 *   Console: Firebase → Crashlytics.
 * - Analytics: usage events (screens, actions). Console: Firebase →
 *   Analytics → Events / DebugView.
 *
 * logger.ts sends every log line here, so app code keeps using
 * `createLogger()`; only analytics events are sent directly (trackEvent).
 *
 * This file must not import logger.ts (logger.ts imports this one).
 * Every call is wrapped: if the native module is missing (app not rebuilt,
 * no google-services.json) logging must never break the app.
 */

type Crashlytics = ReturnType<typeof getCrashlytics>;
type Analytics = ReturnType<typeof getAnalytics>;

let crashlyticsInstance: Crashlytics | null | undefined;
let analyticsInstance: Analytics | null | undefined;

function crashlytics(): Crashlytics | null {
  if (crashlyticsInstance === undefined) {
    try {
      crashlyticsInstance = getCrashlytics();
    } catch {
      crashlyticsInstance = null;
    }
  }
  return crashlyticsInstance;
}

function analytics(): Analytics | null {
  if (analyticsInstance === undefined) {
    try {
      analyticsInstance = getAnalytics();
    } catch {
      analyticsInstance = null;
    }
  }
  return analyticsInstance;
}

/** Runs a Firebase call, ignoring errors (sync throws and rejected promises). */
function safely(run: () => unknown) {
  try {
    const result = run();
    if (result instanceof Promise) {
      result.catch(() => {});
    }
  } catch {
    // Logging must never break the app.
  }
}

export function isFirebaseAvailable() {
  return crashlytics() !== null;
}

// ---------- Crashlytics ----------

/** Adds a line to the log that travels with the next crash / error report. */
export function crashlyticsLog(line: string) {
  const instance = crashlytics();
  if (instance) {
    safely(() => crashlyticsLogLine(instance, line));
  }
}

/** Custom keys shown on every following report (Crashlytics → Keys tab). */
export function setCrashlyticsAttribute(key: string, value: string) {
  const instance = crashlytics();
  if (instance) {
    safely(() => setAttribute(instance, key, value));
  }
}

/**
 * Sends a non-fatal error to Crashlytics (Crashlytics → Non-fatals). The
 * attributes are set right before, so they show up on this report.
 */
export function crashlyticsRecordError(
  error: Error,
  attributes: Record<string, string> = {},
) {
  const instance = crashlytics();
  if (!instance) {
    return;
  }
  safely(async () => {
    await setAttributes(instance, attributes);
    recordError(instance, error);
  });
}

/** Native test crash. The report is sent the next time the app starts. */
export function crashlyticsTestCrash() {
  const instance = crashlytics();
  if (instance) {
    crash(instance);
  }
}

// ---------- Analytics ----------

/** Analytics names: letters, digits and _; up to 40 characters. */
function eventName(name: string) {
  return name
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/^[^A-Za-z]+/, '')
    .slice(0, 40);
}

function safeStringify(value: object) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Params must be strings (≤ 100 chars) or numbers. */
function eventParams(params: Record<string, unknown> = {}) {
  const result: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'number') {
      result[eventName(key)] = value;
    } else if (typeof value === 'object' && value !== null) {
      result[eventName(key)] = safeStringify(value).slice(0, 100);
    } else if (value !== undefined && value !== null) {
      result[eventName(key)] = String(value).slice(0, 100);
    }
  }
  return result;
}

/** A usage event (Analytics → Events; live in DebugView). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  const instance = analytics();
  if (instance) {
    safely(() => logEvent(instance, eventName(name), eventParams(params)));
  }
}

/** Screen view (Analytics → Pages and screens). Called on navigation. */
export function trackScreen(screenName: string) {
  const instance = analytics();
  if (instance) {
    safely(() =>
      logScreenView(instance, {
        screen_name: screenName,
        screen_class: screenName,
      }),
    );
  }
}

/** Called once from index.js: keys that help filter reports. */
export function initFirebase() {
  setCrashlyticsAttribute(
    'environment',
    __DEV__ ? 'development' : 'production',
  );
  crashlyticsLog('App started');
}
