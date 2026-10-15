/** English texts: debug. Keys are used with useTranslation('debug'). */
const debug = {
  actions: {
    logs: {
      label: 'Write one log of each level',
      hint: 'debug/info/warn → console, viewer, breadcrumbs, Sentry Logs',
    },
    handledError: {
      label: 'Capture a handled error',
      hint: 'log.error → Sentry issue + Crashlytics non-fatal, with recent logs',
    },
    message: {
      label: 'Capture a message',
      hint: 'Sentry.captureMessage: an issue without an exception',
    },
    unhandledError: {
      label: 'Throw an unhandled JS error',
      hint: 'Red screen in dev; Sentry and Crashlytics catch it globally',
    },
    unhandledRejection: {
      label: 'Unhandled promise rejection',
      hint: 'A rejected promise nobody catches',
    },
    renderCrash: {
      label: 'Crash while rendering',
      hint: 'react-native-error-boundary shows a fallback; sent to both',
    },
    trace: {
      label: 'Run a traced operation',
      hint: 'Sentry.startSpan → Explore → Traces (with 2 child spans)',
    },
    user: {
      label: 'Set a test user',
      hint: 'Sentry.setUser: every next event shows this user id',
    },
    analytics: {
      label: 'Firebase: send an Analytics event',
      hint: 'logEvent → Firebase → Analytics → DebugView (see docs)',
    },
    crashlytics: {
      label: 'Firebase: Crashlytics test crash',
      hint: 'Native crash; Crashlytics sends it on the next launch',
    },
    nativeCrash: {
      label: 'Native crash',
      hint: 'Sentry.nativeCrash; the report is sent on the next launch',
    },
  },
  toast: {
    sent: '{{what}} sent to Sentry',
    sentryOff: '{{what}} (Sentry off)',
    eventId: 'Event id: {{id}}',
    what: {
      logs: 'Logs',
      handledError: 'Handled error',
      message: 'Message',
      trace: 'Trace',
      user: 'User',
    },
    analyticsSent: 'Event sent to Firebase Analytics',
    firebaseUnavailable: 'Firebase not available (rebuild the app)',
    eventName: 'Name: {{name}}',
  },
  crashAlert: {
    title: 'Crash the app?',
    crashlytics:
      'The app will close. Open it again so Crashlytics can send the report.',
    sentry: 'The app will close. Open it again so Sentry can send the report.',
    cancel: 'Cancel',
    crash: 'Crash',
  },
  status: {
    sentryEnabled: 'Sentry: ✅ enabled',
    sentryDisabled: 'Sentry: ⛔ disabled',
    environment: 'Environment: {{env}}',
    noDsn:
      'Paste your DSN in src/observability/sentryConfig.ts. Until then logs only go to Metro and this screen.',
    firebaseAvailable: 'Firebase: ✅ available',
    firebaseUnavailable: 'Firebase: ⛔ not available',
    firebaseInfo:
      'Crashlytics gets info+ logs and errors; Analytics gets screens and events.',
    firebaseSetup:
      'Needs android/app/google-services.json and a native rebuild.',
  },
  tryIt: 'Try it',
  logsTitle: 'Logs ({{total}}, newest first)',
  clear: 'Clear',
  filterAll: 'all',
  empty: 'No logs yet.',
  sentryEvent: 'Sentry event: {{id}}',
};

export default debug;
