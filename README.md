# ReactNativeExamples

A React Native app with the most used features: one screen per topic, each
showing how to do it with real libraries. Pick an example from the home menu.

Built with **React Native 0.87** (New Architecture, Hermes), **React 19** and
**TypeScript**. The app is translated to **English and Spanish** and supports
**light and dark** themes.

## Features

### Lists and data

| Example | What it shows |
| --- | --- |
| **Lists** | `ScrollView` vs `FlatList` vs `FlashList` with thousands of items |
| **Pokémon (pull to refresh)** | `FlashList` with data from PokeAPI; pull down to load 20 more |
| **Pokémon (infinite scroll)** | `FlashList` with PokeAPI; scroll down to load 25 more |
| **Breaking Bad (axios)** | Characters, quotes and deaths from a REST API with `axios` |

### Forms

| Example | What it shows |
| --- | --- |
| **Form (Formik)** | `KeyboardAvoidingView`, Formik + Yup validation and a toast |
| **Form (React Hook Form)** | The same form with React Hook Form + the Yup resolver |

### Navigation

| Example | What it shows |
| --- | --- |
| **Navigation** | Drawer, bottom tabs and native stack opening the same screen with params |
| **Deep linking** | `rnexamples://form?focus=comments` opens the form and highlights the Comments field |

### State management and storage

The same todo list, built seven ways:

| Example | What it shows |
| --- | --- |
| **Context API** | Shared state five levels deep without prop drilling |
| **Redux Toolkit** | Store, slice and selectors |
| **Zustand** | A Zustand store, no Provider |
| **MobX** | An observable MobX store |
| **AsyncStorage** | React Native's "localStorage": todos survive closing the app |
| **SQLite** | Todos as rows in a SQLite table with `op-sqlite` |
| **Turbo Native Module** | Kotlin / Objective-C++ store and search the todos ([docs](docs/NATIVE_MODULES.md)) |

### Device features

| Example | What it shows |
| --- | --- |
| **Photo gallery** | Telegram-style picker with a live camera (Vision Camera) and the camera roll; saved on the device |
| **Password vault** | PIN or biometrics, lockout after failed attempts, Keychain / Keystore |
| **Live bus map** | 10 simulated buses on Calzada Independencia, updated every 3 s on a MapLibre map |
| **Share and copy** | System share sheet and clipboard for text and images |
| **Accessibility** | Labels, hints and roles read by VoiceOver / TalkBack |

### Animations

| Example | What it shows |
| --- | --- |
| **Animated API** | `timing`, `spring`, `decay`, Easing, `interpolate`, gestures, native driver |
| **Reanimated** | Shared values, gestures, layout animations, CSS animations, scroll, sensors, threads |

### Performance and internals

| Example | What it shows |
| --- | --- |
| **Avoiding re-renders** | `React.memo`, `useCallback`, `useMemo` and `useRef` side by side |
| **Hermes engine** | Bytecode, memory and GC, event loop, `Intl` and benchmarks |
| **Bridging (JS ⇄ native)** | Sync, async, callbacks, events and types with Kotlin / Obj-C |
| **Flipper → DevTools** | What Flipper was and how to debug without it today |

### Debugging and monitoring

| Example | What it shows |
| --- | --- |
| **Debugging (Sentry + Firebase)** | Errors, crashes, traces and logs sent to Sentry and Crashlytics ([Sentry](docs/DEBUGGING_SENTRY.md), [Firebase](docs/FIREBASE.md)) |

### App-wide

- **Settings drawer** (☰ on the home screen, ⚙️ elsewhere): language and theme, saved in AsyncStorage ([docs](docs/I18N_THEME.md)).
- **i18next** translations in English and Spanish, one namespace per feature.
- **Error boundary** with a fallback screen; errors go to Sentry and Crashlytics.
- **Logger** that sends breadcrumbs and logs to both Sentry and Firebase.
- **Jest** tests for stores, schemas and screens in `__tests__/`.

## Tech stack

| Area | Libraries |
| --- | --- |
| Navigation | React Navigation 7 (native stack, bottom tabs, drawer) |
| State | Context, Redux Toolkit, Zustand, MobX |
| Storage | AsyncStorage, op-sqlite, react-native-keychain, react-native-fs |
| Forms | Formik, React Hook Form, Yup |
| Lists | FlashList |
| Animations | Animated, Reanimated 4, Gesture Handler |
| Device | Vision Camera, Camera Roll, Clipboard, Share, MapLibre |
| Networking | axios |
| Monitoring | Sentry, Firebase Crashlytics + Analytics |
| i18n | i18next, react-i18next |

## Getting started

Requirements: Node 22.11 or newer and the
[React Native environment setup](https://reactnative.dev/docs/set-up-your-environment)
for Android and/or iOS.

```sh
npm install

# iOS only
bundle install
cd ios && bundle exec pod install && cd ..

npm start          # Metro
npm run android    # or: npm run ios
```

### Firebase config (not in the repo)

The Firebase config files are not committed. To build with Firebase, create
your own project and add:

- Android: `android/app/google-services.json`
- iOS: `ios/ReactNativeExamples/GoogleService-Info.plist`

See [docs/FIREBASE.md](docs/FIREBASE.md) for the full setup.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start Metro |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS |
| `npm test` | Run the Jest tests |
| `npm run lint` | Run ESLint |

## Project structure

```
App.tsx               Navigation, providers and error boundary
specs/                Codegen specs for the Turbo Native Modules
src/
  screens/<topic>/    One folder per example
  navigation/         Routes, menu order and deep link config
  i18n/locales/       English and Spanish texts
  observability/      Sentry, Firebase, logger, error boundary
  settings/           Settings drawer (language, theme)
  theme/              Light and dark colors, useTheme()
  components/form/    Reusable form fields
android/, ios/        Native projects (incl. Kotlin and Obj-C++ modules)
docs/                 Guides for each integration
__tests__/            Jest tests
```

### Adding a new example

1. Create the screen in `src/screens/<topic>/`.
2. Add the route to `RootStackParamList` in `src/navigation/types.ts`.
3. Register the screen in `App.tsx`.
4. Add the route to `EXAMPLES` in `src/navigation/examples.ts`.
5. Add its title and menu entry to `src/i18n/locales/{en,es}/navigation.ts`.
