/** English texts: hermes. Keys are used with useTranslation('hermes'). */
const hermes = {
  about: {
    section: 'What is Hermes?',
    title: 'A JavaScript engine made for React Native',
    description:
      'React Native runs your JavaScript inside an engine on the phone. Hermes, by Meta, is that engine by default since React Native 0.70.',
    steps: {
      bundle: 'Metro bundles all your JS (and node_modules) into one file.',
      compile:
        'In release builds `hermesc` compiles that bundle to Hermes bytecode.',
      launch:
        'On launch, Hermes loads the bytecode and interprets it on the JS thread.',
      jsi: 'Through JSI it talks directly to native code (Fabric, TurboModules, Reanimated…) without a JSON bridge.',
    },
  },
  sections: {
    device: 'This device',
    deviceSubtitle: 'Live information from the engine.',
    howItWorks: 'How it works',
    supports: 'What it supports',
    performance: 'Performance and tools',
  },
  comparison: {
    section: 'Hermes vs a JIT engine',
    subtitle: 'JavaScriptCore (Safari) or V8 (Chrome).',
    hermes: 'Hermes',
    jit: 'JIT engine',
    rows: {
      compiled: {
        topic: 'When JS is compiled',
        hermes: 'At build time (bytecode)',
        jit: 'On the device, at startup',
      },
      startup: {
        topic: 'Startup',
        hermes: 'Fast: bytecode is mapped',
        jit: 'Slower: parse + compile first',
      },
      memory: {
        topic: 'Memory',
        hermes: 'Low (no JIT code caches)',
        jit: 'Higher',
      },
      peakCpu: {
        topic: 'Peak CPU speed',
        hermes: 'Interpreter, no JIT',
        jit: 'JIT can be faster for hot loops',
      },
      appSize: {
        topic: 'App size',
        hermes: 'Bytecode is compact',
        jit: 'Engine + source text',
      },
      debugging: {
        topic: 'Debugging',
        hermes: 'CDP: React Native DevTools',
        jit: 'Safari / Chrome remote',
      },
    },
    note: 'Hermes V1 (default since React Native 0.84) improves startup, memory and run-time speed further without code changes.',
  },
  engine: {
    title: 'Which engine is running?',
    description:
      "HermesInternal only exists on Hermes, so it's the usual way to detect it. Its properties tell the exact engine build.",
    hermes: '✅ Running on Hermes',
    notHermes: '❌ Not Hermes (JSC or a test)',
    noProperties: 'No runtime properties available.',
    note: 'Enabled in android/gradle.properties with hermesEnabled=true (already on). Since React Native 0.84 the default is Hermes V1.',
  },
  bytecode: {
    title: 'Ahead-of-time bytecode',
    description:
      "In release builds the JS is compiled to Hermes bytecode (.hbc) while building the APK, so the phone doesn't parse or compile JS at startup and just maps the file into memory.",
    steps: {
      debug:
        'Debug: Metro sends plain JS; Hermes compiles it on the device (slower start, needed for Fast Refresh).',
      release:
        'Release: `hermesc` turns index.android.bundle into bytecode at build time.',
      launch:
        'On launch the bytecode is memory-mapped: faster startup and less RAM. There is no JIT; Hermes interprets the bytecode.',
    },
    note: 'In a release build this prints "[bytecode]" instead of the source code: the original JS isn\'t shipped inside the app.',
  },
  memory: {
    title: 'Memory and garbage collection',
    description:
      'Hermes uses a generational, mostly concurrent garbage collector (Hades): young objects are collected quickly, and most of the old-generation work happens off the JS thread.',
    heapSize: 'Heap size',
    allocated: 'Allocated (live)',
    collections: 'Garbage collections',
    gcTime: 'Total GC time',
    onlyHermes: 'GC stats are only available on Hermes.',
    allocate: 'Allocate 200k objects',
    release: 'Release',
    note: 'Allocate a few times and watch the heap grow; release and the next collections bring it down. For details: DevTools → Memory → heap snapshot.',
  },
  eventLoop: {
    title: 'Event loop: microtasks vs timers',
    description:
      'Hermes runs promises natively. Microtasks run as soon as the current code finishes, before any timer, even a 0 ms one.',
    run: 'Run',
    order: {
      syncStart: '1. sync: start',
      syncEnd: '2. sync: end',
      promise: '3. Promise.then (microtask)',
      microtask: '4. queueMicrotask (microtask)',
      timeout: '5. setTimeout 0 (macrotask)',
    },
  },
  features: {
    title: 'Modern JavaScript support',
    description:
      'Checked live on this device. Missing built-ins can be added with polyfills; syntax is handled by Babel and the Hermes compiler.',
    summary: '{{supported}} of {{total}} supported',
  },
  intl: {
    title: 'Intl',
    description:
      "Hermes implements Intl on top of the platform's own locale data (Android's ICU / iOS Foundation), so it doesn't add megabytes to the app.",
    notSupported: 'not supported ({{error}})',
  },
  benchmarks: {
    title: 'Benchmarks',
    description:
      'Hermes trades peak speed (no JIT) for fast startup and low memory. These numbers are for this device; debug builds are much slower than release.',
    run: 'Run benchmarks',
    running: 'Running…',
    names: {
      fib: 'fib(27), recursive calls',
      sort: 'Sort 200,000 numbers',
      json: 'JSON stringify + parse (20,000 objects)',
      string: 'Build a 1M-char string',
      map: 'Map with 100,000 keys',
    },
    details: {
      json: '{{mb}} MB, {{total}} items',
      string: '{{total}} chars',
      map: '{{total}} entries',
    },
    note: 'To compare engines, set hermesEnabled=false in gradle.properties, rebuild, and run them again (this app is set up for Hermes, so do it only as an experiment).',
  },
  debugging: {
    title: 'Debugging and profiling',
    description:
      'Hermes has a built-in debugger: React Native DevTools connects to it directly (see the Flipper → DevTools screen).',
    steps: {
      sources: 'Press `j` in Metro → Sources: breakpoints run inside Hermes.',
      performance:
        'Performance tab: Hermes sampling profiler (JS call stacks over time).',
      memory:
        'Memory tab: heap snapshots and allocation timelines from the Hermes GC.',
      crashes:
        'Release crashes: Sentry symbolicates Hermes stack traces with the source maps.',
    },
  },
};

export default hermes;
