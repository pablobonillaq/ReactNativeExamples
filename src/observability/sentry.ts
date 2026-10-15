import * as Sentry from '@sentry/react-native';
import { AppState } from 'react-native';
import { createLogger, isLoggerConsoleLine, redact } from './logger';
import {
  SENTRY_DSN,
  SENTRY_ENABLED_IN_DEV,
  SENTRY_SDK_DEBUG,
  TRACES_SAMPLE_RATE,
} from './sentryConfig';

/**
 * Sentry setup. Imported first thing in index.js so errors thrown while the
 * rest of the app loads are captured too.
 *
 * What Sentry records automatically once this runs:
 * - Unhandled JS errors and unhandled promise rejections.
 * - Native crashes (Java/Kotlin, Objective-C/Swift, C++) on the next launch.
 * - Breadcrumbs: taps, navigation, fetch/axios requests, console calls,
 *   app going to background/foreground.
 * - Performance: a trace per screen navigation (time to display, slow and
 *   frozen frames) with the HTTP requests made during it.
 */

/**
 * Connects Sentry to React Navigation (registered in App.tsx): names traces
 * and breadcrumbs after the screen and measures how long each one takes to
 * show.
 */
export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

export const isSentryEnabled =
  SENTRY_DSN.length > 0 && (!__DEV__ || SENTRY_ENABLED_IN_DEV);

const log = createLogger('App');

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: isSentryEnabled,
  debug: SENTRY_SDK_DEBUG,
  environment: __DEV__ ? 'development' : 'production',

  // Errors
  attachStacktrace: true,
  // Don't send IP address / device name / user identifiers automatically.
  sendDefaultPii: false,
  // Screenshots are off on purpose: the vault shows passwords on screen.
  attachScreenshot: false,

  // Logs (sentry.io → Explore → Logs); written by src/observability/logger.ts
  enableLogs: true,

  // Performance
  tracesSampleRate: TRACES_SAMPLE_RATE,
  integrations: [navigationIntegration],

  maxBreadcrumbs: 100,

  beforeBreadcrumb(breadcrumb) {
    // The logger already adds a richer breadcrumb for its console lines.
    if (
      breadcrumb.category === 'console' &&
      isLoggerConsoleLine(breadcrumb.message)
    ) {
      return null;
    }
    return breadcrumb;
  },

  beforeSend(event) {
    // Last line of defence: never let secrets leave the device.
    if (event.extra) {
      event.extra = redact(event.extra);
    }
    return event;
  },
});

log.info('App started', {
  sentry: isSentryEnabled ? 'enabled' : 'disabled',
  environment: __DEV__ ? 'development' : 'production',
});

if (!SENTRY_DSN) {
  log.warn(
    'Sentry DSN is empty: events are not sent. Set it in src/observability/sentryConfig.ts',
  );
}

// Foreground / background changes help explain bugs after resuming the app.
AppState.addEventListener('change', state => {
  log.info('App state changed', { state });
});

export { Sentry };
