import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { createLogger, type Logger, type LogData } from './logger';

/** Thrown by fetch-based API clients when the server answers with an error. */
export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
}

/** True when the request was cancelled on purpose (AbortController). */
export function isCancelled(error: unknown) {
  return (
    axios.isCancel(error) ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

/**
 * Offline, DNS failure or timeout: worth a warning, not a Sentry issue
 * (there's nothing to fix in the code).
 */
export function isConnectivityError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return !error.response;
  }
  // fetch() in React Native rejects with TypeError('Network request failed').
  return error instanceof TypeError && /network/i.test(error.message);
}

/**
 * Logs a failed request with the right level:
 * - cancelled → debug (not a failure)
 * - no connection / timeout → warn (breadcrumb + Sentry Logs)
 * - anything else (4xx, 5xx, bad JSON, bugs) → error (Sentry issue)
 */
export function logRequestError(
  log: Logger,
  message: string,
  error: unknown,
  data?: LogData,
) {
  if (isCancelled(error)) {
    log.debug(`${message} (cancelled)`, data);
  } else if (isConnectivityError(error)) {
    log.warn(message, data, error);
  } else {
    log.error(message, error, { ...data, status: statusOf(error) });
  }
}

function statusOf(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  if (error instanceof HttpError) {
    return error.status;
  }
  return undefined;
}

type TimedConfig = InternalAxiosRequestConfig & { startedAt?: number };

function describeRequest(config: InternalAxiosRequestConfig | undefined) {
  return `${(config?.method ?? 'get').toUpperCase()} ${config?.url ?? '?'}`;
}

/**
 * Logs every request of an axios instance: start, status and duration.
 * (Sentry already records requests as breadcrumbs/spans; this adds them to
 * the console and the in-app log viewer with the params.)
 */
export function instrumentAxios(instance: AxiosInstance, scope: string) {
  const log = createLogger(scope);

  instance.interceptors.request.use(config => {
    (config as TimedConfig).startedAt = Date.now();
    log.debug(`→ ${describeRequest(config)}`, { params: config.params });
    return config;
  });

  instance.interceptors.response.use(
    response => {
      const config = response.config as TimedConfig;
      log.debug(`← ${response.status} ${describeRequest(config)}`, {
        durationMs: config.startedAt
          ? Date.now() - config.startedAt
          : undefined,
      });
      return response;
    },
    error => {
      if (!isCancelled(error) && axios.isAxiosError(error)) {
        const config = error.config as TimedConfig | undefined;
        log.debug(
          `✕ ${error.response?.status ?? error.code} ${describeRequest(
            config,
          )}`,
          {
            durationMs: config?.startedAt
              ? Date.now() - config.startedAt
              : undefined,
          },
        );
      }
      return Promise.reject(error);
    },
  );
}
