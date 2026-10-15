/** English texts: bridging. Keys are used with useTranslation('bridging'). */
const bridging = {
  sections: {
    what: 'What is bridging?',
    oldVsJsi: 'The old bridge vs JSI',
    oldVsJsiSubtitle:
      'Why React Native replaced the bridge with the New Architecture.',
    jsToNative: 'JS → native',
    jsToNativeSubtitle: 'Three ways to call native code from JavaScript.',
    nativeToJs: 'Native → JS',
    nativeToJsSubtitle: 'Native code takes the initiative.',
    data: 'Data across the boundary',
    dataSubtitle: 'What happens to values and errors on the way.',
    performance: 'Performance',
    otherKinds: 'Other kinds of bridging',
  },
  intro: {
    title: 'Two worlds that need to talk',
    description:
      'Your React code runs as JavaScript in Hermes. The camera, sensors, storage and the real screen views live in native code. Bridging is how each side calls the other and converts the data between them.',
    steps: {
      spec: 'You describe the module in TypeScript: `specs/NativeBridgeDemo.ts`.',
      codegen:
        'At build time Codegen turns that spec into C++ glue plus a Kotlin base class and an Objective-C protocol.',
      implement:
        'You implement it natively: `NativeBridgeDemoModule.kt` and `RCTNativeBridgeDemo.mm`.',
      use: 'JS gets it with `TurboModuleRegistry.get(…)` and calls its methods like any object.',
    },
  },
  status: {
    loaded: '✓ NativeBridgeDemo is loaded ({{os}}). Try the demos below.',
    missing:
      '✗ NativeBridgeDemo is not in the installed app. Native code needs a new build: run `npm run android` (Metro reload is not enough).',
  },
  comparison: {
    oldBridge: 'Old bridge',
    newArchitecture: 'New Architecture',
    rows: {
      travel: {
        topic: 'How calls travel',
        bridge: 'Serialized to JSON, queued and sent in batches',
        jsi: 'Direct C++ calls through JSI, no JSON',
      },
      sync: {
        topic: 'Sync calls',
        bridge: 'No (async only)',
        jsi: 'Yes, when the method returns a value',
      },
      types: {
        topic: 'Types',
        bridge: 'Checked at run time (or not at all)',
        jsi: 'Typed spec; Codegen checks it at build time',
      },
      loading: {
        topic: 'Loading',
        bridge: 'Every module at startup',
        jsi: 'Lazily, the first time JS uses it',
      },
      views: {
        topic: 'Native views',
        bridge: 'Paper (UIManager)',
        jsi: 'Fabric (C++ renderer)',
      },
      reactNative: {
        topic: 'In React Native',
        bridge: 'Until 0.75 by default',
        jsi: 'Default since 0.76; the only one in 0.82+',
      },
    },
    note: 'People still say "bridging" for any JS ⇄ native communication, even though today it goes through JSI and there is no bridge anymore.',
  },
  otherKinds: {
    nativeUi: {
      title: 'Native UI components',
      description:
        'A native view used as a React component (Fabric + codegenNativeComponent). In this app: the MapLibre map and the camera preview.',
    },
    legacy: {
      title: 'Legacy native modules',
      description:
        'Modules written for the old bridge (NativeModules.X) still work through the interop layer, but migrating them to Turbo Modules is recommended.',
    },
    cxx: {
      title: 'C++ Turbo Modules',
      description:
        'One C++ implementation shared by Android and iOS, called through JSI.',
    },
    nitro: {
      title: 'Nitro Modules',
      description:
        'Third-party JSI framework (used here by react-native-nitro-image): typed "hybrid objects" in Swift, Kotlin or C++.',
    },
    expo: {
      title: 'Expo Modules',
      description:
        'Swift / Kotlin modules with a declarative API (Function, AsyncFunction, Events), installable in any React Native app.',
    },
    hostFunctions: {
      title: 'JSI host functions',
      description:
        'C++ functions installed straight into the JS runtime. Reanimated and worklets use them to run JS on the UI thread.',
    },
    note: 'Another example in this app: Todo list (Turbo Native Module) stores its data with the same technique. Guide: docs/NATIVE_MODULES.md.',
  },

  // bridgingDemos.tsx
  buttons: {
    currentThread: 'Call currentThread()',
    asyncThread: 'Call asyncThread() and addAsync()',
    withCallback: 'Call withCallback(21, …)',
    fail: 'Call fail()',
  },
  missing: 'Native module not available: rebuild the app (npm run android).',
  sync: {
    title: 'Sync call',
    description:
      'JS calls {{language}} and gets the value back on the same line, like a normal function. It runs on the JS thread, so it must be fast: while it runs, JS is blocked.',
  },
  async: {
    title: 'Async call (Promise)',
    description:
      'The method returns a Promise. Native code runs it on a background thread and resolves it later, so the JS thread keeps working. Use it for anything slow: disk, network, crypto.',
    otherThread: 'A sync call ran on "{{thread}}": a different thread.',
  },
  callback: {
    title: 'Callback',
    description:
      'JS passes a function; native code calls it with the result. A callback can be called only once. Promises are usually nicer; callbacks remain for older APIs.',
  },
  events: {
    title: 'Events: native → JS',
    description:
      'Here the initiative is native: a {{language}} timer sends an event every 500 ms. Used for sensors, downloads, push notifications… Always remove the subscription when the screen closes.',
    tickInfo:
      'sent from thread "{{thread}}"\narrived {{latency}} ms after native created it',
  },
  types: {
    title: 'Type conversion',
    description:
      'JS and {{language}} have different types. Codegen converts each value; {{language}} answers what it received.',
    send: 'Send the object',
    note: 'Notice that 42 arrives as a decimal number: JS has only one number type. Typed specs (string, number, boolean, objects) are checked by Codegen at build time; UnsafeObject skips that check.',
  },
  errors: {
    title: 'Errors',
    description:
      'Native code rejects the Promise with a code and a message; JS receives a normal Error you can catch. Use codes to tell errors apart (E_NOT_FOUND, E_PERMISSION…).',
  },
  benchmark: {
    title: 'Cost of crossing',
    description:
      'The same tiny job done three ways. Crossing to native has a cost, and an async call adds a thread hop and a Promise. Batch work into fewer calls instead of many small ones.',
    running: 'Running…',
    run: 'Run {{calls}} calls each',
    names: {
      js: 'Plain JS function',
      sync: 'Native sync add()',
      async: 'Native async addAsync()',
    },
    bar: '{{name}}: {{perCall}} µs / call ({{total}} total)',
    note: 'Numbers vary a lot between devices, and debug builds are much slower than release builds.',
  },
};

export default bridging;
