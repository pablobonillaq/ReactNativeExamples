/** English texts: flipper. Keys are used with useTranslation('flipper'). */
const flipper = {
  ui: {
    replacementFlipper: 'Flipper: {{plugin}}',
  },
  about: {
    section: 'What was Flipper?',
    title: 'Flipper (2018 – 2024 in React Native)',
    description:
      'A desktop app by Meta that connected to the app through a native library and offered plugins: logs, network, layout, React DevTools, Hermes debugger, databases, crash reports…',
    removed:
      "In <b>React Native 0.74</b> Flipper was removed from new projects and stopped being supported: it added heavy native dependencies, slowed down builds and often broke after upgrades. It still exists as a standalone tool for native apps, but this app (React Native 0.87, New Architecture) doesn't use it.",
    replacement:
      'Its replacement is <b>React Native DevTools</b>: a Chrome DevTools–based debugger that ships with React Native, with nothing to install.',
  },
  open: {
    section: 'Open React Native DevTools',
    subtitle: 'Needs a debug build and Metro running.',
    title: 'How to open it',
    steps: {
      run: 'Run the app in debug (`npm run android`) with Metro running (`npm start`).',
      press:
        'In the Metro terminal press `j`, or open the Dev Menu (`Ctrl+M` on the emulator, shake a real phone) → Open DevTools.',
      tabs: 'A Chrome-like window opens with tabs: Console, Sources, Network, Performance, Memory, ⚛️ Components and ⚛️ Profiler.',
    },
    note: 'Each card below shows a Flipper plugin, what replaces it, and a button to see it working.',
  },
  try: {
    section: 'Try it',
    subtitle: 'Keep DevTools open while you press the buttons.',
  },
  migration: {
    section: 'Migration table',
    subtitle: 'Flipper plugin → what to use now.',
    rows: {
      logs: {
        plugin: 'Logs',
        now: 'DevTools → Console · Metro terminal · Android Studio Logcat',
      },
      network: {
        plugin: 'Network',
        now: 'DevTools → Network (React Native 0.83+)',
      },
      layout: {
        plugin: 'Layout inspector',
        now: 'DevTools → Components · Element Inspector · Android Studio Layout Inspector',
      },
      reactDevTools: {
        plugin: 'React DevTools',
        now: 'Built into React Native DevTools (Components + Profiler)',
      },
      hermesDebugger: {
        plugin: 'Hermes Debugger',
        now: 'DevTools → Sources (breakpoints, step, watch)',
      },
      performance: {
        plugin: 'Performance / Perf monitor',
        now: 'DevTools → Performance (0.83+) · Dev Menu → Perf Monitor',
      },
      crashReporter: {
        plugin: 'Crash reporter',
        now: 'Sentry (see Debugging screen) · Logcat',
      },
      storage: {
        plugin: 'AsyncStorage / Shared Preferences',
        now: 'In-app viewer · console.table · App Inspection',
      },
      databases: {
        plugin: 'Databases (SQLite)',
        now: 'Android Studio → App Inspection → Database Inspector',
      },
      images: {
        plugin: 'Images',
        now: 'DevTools → Network (image requests) · Android Studio Profiler',
      },
      redux: {
        plugin: 'Redux / MobX plugins',
        now: 'Reactotron, or Redux DevTools via a dev-only middleware',
      },
    },
    note: 'Other tools: Reactotron (logs, state, network, AsyncStorage) and Radon IDE (debugger inside VS Code) cover some of what Flipper did.',
  },
  console: {
    title: 'Logs',
    description:
      'Flipper had a Logs plugin with device logs. Today JS logs go to the Console tab of React Native DevTools (and to the Metro terminal).',
    replacement: {
      flipper: 'Logs plugin',
      today: 'DevTools → Console',
    },
    buttons: {
      object: 'object',
      logger: 'logger (Sentry)',
    },
    sent: '{{label}} sent: look at the Console tab',
    note: 'Native logs (Java/Kotlin, crashes) are in Android Studio → Logcat, or with adb logcat.',
  },
  network: {
    title: 'Network',
    description:
      'Each button makes a real request. In the Network panel you can see its URL, status, headers, timing and response body.',
    replacement: {
      flipper: 'Network plugin',
      today: 'DevTools → Network (RN 0.83+)',
    },
    results: {
      weighs: '{{status}}, {{name}} weighs {{weight}}',
      created: '{{status}}, created id {{id}}',
      failed: '(failed request in red)',
      characters: '{{status}}, {{total}} characters',
    },
    steps: {
      open: 'Open DevTools: press `j` in the Metro terminal.',
      tab: 'Go to the Network tab and press a button above.',
      click: 'Click a request → Headers, Preview, Response, Timing.',
    },
  },
  components: {
    title: 'Components and layout',
    description:
      'Flipper showed the native view tree and a React DevTools plugin. Now React DevTools is built into React Native DevTools.',
    replacement: {
      flipper: 'Layout inspector + React DevTools plugin',
      today: 'DevTools → ⚛️ Components · Dev Menu → Element Inspector',
    },
    inspectMe: 'Inspect me',
    countState: 'count (state): {{value}}',
    steps: {
      search: 'DevTools → ⚛️ Components → search "InspectMe".',
      select:
        'Select it: you see its props (title, color) and state (count). Edit them there and the screen updates.',
      device:
        'On the device: Dev Menu (Ctrl+M) → Toggle Element Inspector, then tap the box to see its styles and size.',
      native: 'Native view tree: Android Studio → Tools → Layout Inspector.',
    },
  },
  profiler: {
    title: 'Profiler',
    description:
      'Shows which components rendered, why, and how long each one took.',
    replacement: {
      flipper: 'React DevTools profiler',
      today: 'DevTools → ⚛️ Profiler',
    },
    buttons: {
      render: 'Render 60 slow rows',
      rerender: 'Re-render all',
      clear: 'Clear',
    },
    row: 'Row {{number}} · {{value}}',
    steps: {
      record: 'DevTools → ⚛️ Profiler → press the round record button.',
      press: 'Press "Render 60 slow rows", then stop recording.',
      flame:
        'The flame chart shows SlowRow taking most of the time. Settings → "Record why each component rendered" explains each render.',
    },
  },
  performance: {
    title: 'Performance',
    description:
      'Records a timeline of JS work, React renders and your own User Timings.',
    replacement: {
      flipper: 'Performance plugins',
      today: 'DevTools → Performance (RN 0.83+) · Dev Menu → Perf Monitor',
    },
    button: 'Run 3M iterations',
    result: 'Took {{ms}} ms on the JS thread (sum {{sum}})',
    steps: {
      record: 'DevTools → Performance → record (⏺).',
      press: 'Press the button, then stop.',
      find: 'Find the "Heavy work (demo)" block in the Timings track and the long task on the JS thread.',
      fps: 'Live FPS on the device: Dev Menu → Perf Monitor.',
    },
  },
  debugger: {
    title: 'Breakpoints',
    description:
      'Pause the app on a line, inspect variables and step through the code.',
    replacement: {
      flipper: 'Hermes Debugger plugin',
      today: 'DevTools → Sources',
    },
    total: 'Total with tax: ${{total}}',
    steps: {
      open: 'DevTools → Sources → `Ctrl+P` → type flipperDemos.',
      click: 'Click the line number of "const line = item.price * item.qty".',
      press:
        'Press the button: the app pauses there. Hover item / total, use Step over (F10) and Resume (F8).',
    },
  },
  storage: {
    title: 'Storage',
    description:
      "There's no storage tab in DevTools, so the app can show its own data (and print it to the Console).",
    replacement: {
      flipper: 'AsyncStorage · Shared Preferences · Databases',
      today: 'In-app viewer / console.table · Android Studio → App Inspection',
    },
    buttons: {
      read: 'Read AsyncStorage',
      write: 'Write a test key',
    },
    empty: 'AsyncStorage is empty.',
    note: "The vault's secrets are in Keychain / Keystore, not here. The SQLite todos (todos.sqlite) can be opened in Android Studio → App Inspection → Database Inspector.",
  },
};

export default flipper;
