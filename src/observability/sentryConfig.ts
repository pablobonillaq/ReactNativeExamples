/**
 * Sentry settings. The DSN is not a secret (it only allows *sending* events
 * to your project), so it's fine to keep it in the code.
 *
 * Where to find it: sentry.io → Settings → Projects → <your project> →
 * Client Keys (DSN).
 *
 * While it's empty, Sentry stays disabled and the logger only prints to the
 * Metro console and to the in-app log viewer (Home → Debugging (Sentry)).
 */
export const SENTRY_DSN: string =
  'https://d5358a58a347d2277cb8a81c37e966c7@o4512204786434048.ingest.us.sentry.io/4512204833292293';

/**
 * Also send events while developing (`__DEV__`). Handy to try Sentry from
 * the emulator; set it to false once you only care about release builds.
 */
export const SENTRY_ENABLED_IN_DEV = true;

/**
 * Prints what the Sentry SDK itself is doing (init, events sent, transport
 * errors) to the Metro console. Turn it on when an event doesn't show up.
 */
export const SENTRY_SDK_DEBUG = false;

/** Share of navigations / operations recorded as performance traces. */
export const TRACES_SAMPLE_RATE = __DEV__ ? 1.0 : 0.2;
