/** English texts: navigation. Screen titles (headers) and the main menu. */
const navigation = {
  /** Header titles, by route name. */
  screens: {
    Home: 'React Native Examples',
    Lists: 'Lists: performance',
    Pokemon: 'Pokémon',
    PokemonInfinite: 'Pokémon: infinite scroll',
    PersonForm: 'Person form',
    PersonFormRHF: 'Person form (RHF)',
    DeepLinkDemo: 'Deep linking',
    BreakingBad: 'Breaking Bad',
    Todo: 'Todo list (Context API)',
    TodoRedux: 'Todo list (Redux Toolkit)',
    TodoZustand: 'Todo list (Zustand)',
    TodoMobx: 'Todo list (MobX)',
    TodoStorage: 'Todo list (AsyncStorage)',
    TodoSqlite: 'Todo list (SQLite)',
    TodoNative: 'Todo list (Native Module)',
    PhotoGallery: 'Photo gallery',
    Accessibility: 'Accessibility',
    Vault: 'Password vault',
    BusesMap: 'Live buses',
    Share: 'Share & copy',
    AnimatedApi: 'Animated API',
    Reanimated: 'Reanimated',
    Flipper: 'Flipper → DevTools',
    Hermes: 'Hermes engine',
    Rerenders: 'Avoiding re-renders',
    Bridging: 'Bridging (JS ⇄ native)',
    SentryDebug: 'Debugging (Sentry + Firebase)',
  },
  /** Main menu entries, by route name. */
  menu: {
    Lists: {
      title: 'Lists',
      description:
        'ScrollView vs FlatList vs FlashList with thousands of items',
    },
    Pokemon: {
      title: 'Pokémon (API + pull to refresh)',
      description: 'FlashList fed by PokeAPI; pull down to load the next 20',
    },
    PokemonInfinite: {
      title: 'Pokémon (API + infinite scroll)',
      description: 'FlashList fed by PokeAPI; scroll down to load 25 more',
    },
    PersonForm: {
      title: 'Form (Formik + validation)',
      description: 'KeyboardAvoidingView, Formik + Yup validation and a toast',
    },
    PersonFormRHF: {
      title: 'Form (React Hook Form + validation)',
      description: 'The same form built with React Hook Form + Yup resolver',
    },
    NavigationDemo: {
      title: 'Navigation (drawer, tabs, stack)',
      description: 'Every navigator opens the same screen with params',
    },
    DeepLinkDemo: {
      title: 'Deep linking',
      description: 'A URL opens the form and highlights the Comments field',
    },
    BreakingBad: {
      title: 'Breaking Bad (axios)',
      description: 'Characters, quotes and deaths from a REST API with axios',
    },
    Todo: {
      title: 'Todo list (Context API)',
      description: 'State shared 5 components deep without prop drilling',
    },
    TodoRedux: {
      title: 'Todo list (Redux Toolkit)',
      description: 'The same todo list with a Redux store, slice and selectors',
    },
    TodoZustand: {
      title: 'Todo list (Zustand)',
      description:
        'The same todo list with a Zustand store, no Provider needed',
    },
    TodoMobx: {
      title: 'Todo list (MobX)',
      description: 'The same todo list with an observable MobX store',
    },
    TodoStorage: {
      title: 'Todo list (AsyncStorage)',
      description: "RN's localStorage: todos survive closing the app",
    },
    TodoSqlite: {
      title: 'Todo list (SQLite)',
      description: 'Todos stored as rows of a SQLite table with op-sqlite',
    },
    TodoNative: {
      title: 'Todo list (Turbo Native Module)',
      description: 'Kotlin / Objective-C++ store and search the todos natively',
    },
    PhotoGallery: {
      title: 'Photo gallery (camera + gallery)',
      description: 'Telegram-style picker with live camera; saved on device',
    },
    Accessibility: {
      title: 'Accessibility (VoiceOver / TalkBack)',
      description: 'Labels, hints and roles read by screen readers',
    },
    Vault: {
      title: 'Password vault (secure storage)',
      description: 'PIN or biometrics, lockout, Keychain / Keystore',
    },
    BusesMap: {
      title: 'Live buses map (Calzada Independencia)',
      description: '10 simulated buses updating every 3 s on a MapLibre map',
    },
    Share: {
      title: 'Share & copy (text and image)',
      description: 'System share sheet and clipboard for text and images',
    },
    AnimatedApi: {
      title: 'Animations (core Animated API)',
      description: 'timing, spring, decay, Easing, interpolate, gestures…',
    },
    Reanimated: {
      title: 'Animations (Reanimated)',
      description: 'Shared values, gestures, layout animations, sensors…',
    },
    Flipper: {
      title: 'Flipper → React Native DevTools',
      description: 'What Flipper was and how to debug without it today',
    },
    Hermes: {
      title: 'Hermes engine',
      description: 'Bytecode, memory and GC, event loop, Intl and benchmarks',
    },
    Rerenders: {
      title: 'Avoiding re-renders',
      description: 'React.memo, useCallback, useMemo and useRef side by side',
    },
    Bridging: {
      title: 'Bridging (JS ⇄ native)',
      description:
        'Sync, async, callbacks, events and types with Kotlin / Obj-C',
    },
    SentryDebug: {
      title: 'Debugging (Sentry + Firebase)',
      description: 'Errors, crashes, traces and logs in Sentry and Crashlytics',
    },
  },
};

export default navigation;
