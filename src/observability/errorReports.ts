import { useSyncExternalStore } from 'react';

/**
 * Last error caught by AppErrorBoundary.
 *
 * onError runs after the fallback is first rendered, so ErrorFallback
 * subscribes to this tiny store to show the Sentry event id once known.
 */

type Report = { sentryEventId?: string; timestamp: number };

let lastReport: Report | null = null;
const listeners = new Set<() => void>();

export function setLastErrorReport(report: Report) {
  lastReport = report;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLastErrorReport() {
  return useSyncExternalStore(subscribe, () => lastReport);
}
