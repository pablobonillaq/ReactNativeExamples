import type { ReactNode } from 'react';
import ErrorBoundary from 'react-native-error-boundary';
import { ErrorFallback } from './ErrorFallback';
import { setLastErrorReport } from './errorReports';
import { trackEvent } from './firebase';
import { createLogger } from './logger';

const log = createLogger('ErrorBoundary');

/**
 * Error boundary for the whole app (react-native-error-boundary).
 *
 * When a component throws while rendering, React unmounts the tree; without
 * a boundary that is a blank screen. This one shows ErrorFallback instead
 * and reports the error through the logger, which sends it to:
 * - Sentry, as an issue (captureException), and
 * - Firebase Crashlytics, as a non-fatal error with the recent log lines.
 * It also records an `error_boundary_shown` event in Firebase Analytics.
 *
 * Note: error boundaries only catch errors thrown while rendering (and in
 * lifecycle methods / effects). Errors in event handlers or promises are
 * caught by the global handlers of Sentry and Crashlytics instead.
 */
export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}

function handleError(error: Error, componentStack: string) {
  const sentryEventId = log.error(
    'Render error caught by the error boundary',
    error,
    // The component stack says which component threw.
    { componentStack: componentStack.slice(0, 2000) },
  );
  trackEvent('error_boundary_shown', {
    error_name: error.name,
    error_message: error.message,
  });
  setLastErrorReport({ sentryEventId, timestamp: Date.now() });
}
