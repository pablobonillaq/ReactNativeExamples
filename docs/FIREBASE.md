# Logs and errors in Firebase (Crashlytics + Analytics)

The app reports to **Firebase** and **Sentry** at the same time. App code
doesn't change: it keeps using `createLogger()` and the logger sends each line
to both.

| What happens in the app | Sentry | Firebase |
| --- | --- | --- |
| `log.info / warn` | Breadcrumb + Sentry Logs | Line in the Crashlytics log (attached to the next report) |
| `log.debug` | Breadcrumb | — (only info and above, see `firebaseLogLevel`) |
| `log.error(msg, error)` | Issue (`captureException`) | Non-fatal error (`recordError`) with keys `scope`, `message`, `sentry_event_id` |
| Render error | `react-native-error-boundary` → `log.error` → both | Same + Analytics event `error_boundary_shown` |
| Unhandled JS error / promise | Global handler | Global handler (chained with Sentry's) |
| Native crash | Sent on next launch | Sent on next launch |
| Screen change | Tag `screen` | Key `screen` + Analytics `screen_view` |

Firebase project: **react-native-examples** (`react-native-examples-af8f7`),
Android app `com.reactnativeexamples`.

## Files

- `src/observability/firebase.ts`: Crashlytics + Analytics wrapper (modular API, never throws).
- `src/observability/logger.ts`: `sendToFirebase()` next to `sendToSentry()`.
- `src/observability/AppErrorBoundary.tsx`: `react-native-error-boundary` around the app (App.tsx).
- `src/observability/ErrorFallback.tsx`: the screen shown after a render error.
- `index.js`: `initFirebase()` sets the `environment` key.
- `firebase.json`: React Native Firebase options (see below).
- Android: `android/build.gradle` (classpaths) and `android/app/build.gradle` (plugins).

## Setup (once)

1. Download `google-services.json` from Firebase console → ⚙️ Project settings →
   General → Android app `com.reactnativeexamples` → **google-services.json**,
   and save it as `android/app/google-services.json`.
   Without it, the Android build fails (the Google Services plugin needs it).
2. Install the packages and rebuild the native app (Metro reload is not enough):

   ```powershell
   npm install
   npm run android
   ```

`google-services.json` is not a secret like a password, but if the GitHub repo
is public you may prefer to add it to `.gitignore`.

## Where to see things

- **Crashlytics**: Firebase console → Crashlytics. Reports are sent when the
  app restarts (crashes) or shortly after (non-fatals). Open an issue → **Logs**
  tab for the log lines and **Keys** tab for `screen`, `scope`, etc.
  The dashboard appears after the first report arrives.
- **Analytics**: events take hours to appear in the reports. To see them live:

  ```powershell
  adb shell setprop debug.firebase.analytics.app com.reactnativeexamples
  ```

  then Firebase console → Analytics → **DebugView**. Turn it off with
  `adb shell setprop debug.firebase.analytics.app .none.`
- **Crashlytics debug logs on the device**:
  `adb shell setprop log.tag.FirebaseCrashlytics DEBUG` and then
  `adb logcat -s FirebaseCrashlytics`.

## Try it

Menu → **Debugging (Sentry + Firebase)**:

- *Capture a handled error* → Sentry issue + Crashlytics non-fatal.
- *Crash while rendering* → error boundary fallback; reported to both.
- *Firebase: send an Analytics event* → `debug_test_event` in DebugView.
- *Firebase: Crashlytics test crash* → closes the app; reopen it to send.

## firebase.json

| Option | Value | Why |
| --- | --- | --- |
| `crashlytics_debug_enabled` | `true` | Send reports from debug builds too (off by default). Set `false` to report only from release builds. |
| `crashlytics_javascript_exception_handler_chaining_enabled` | `true` | Crashlytics passes JS errors on to the previous handler (Sentry's). |
| `google_analytics_automatic_screen_reporting_enabled` | `false` | Screens are logged from React Navigation in App.tsx instead. |

## iOS

Not configured yet (it can't be built on Windows). On a Mac:

1. Firebase console → Add app → iOS, bundle id from Xcode; download
   `GoogleService-Info.plist` and add it to the Xcode project (Copy items if needed).
2. `ios/Podfile`: `use_frameworks! :linkage => :dynamic` before
   `use_react_native!` (React Native Firebase uses Swift Package Manager).
   Check that the other native libraries still build with dynamic frameworks.
3. `AppDelegate.swift`: `import Firebase` and `FirebaseApp.configure()` at the
   start of `application(_:didFinishLaunchingWithOptions:)`.
4. `cd ios; pod install --repo-update`.
