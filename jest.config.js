module.exports = {
  preset: '@react-native/jest-preset',
  // The first render of a screen in each file can take several seconds on a
  // cold cache (Babel transforms + all translations), more than Jest's 5 s.
  testTimeout: 20000,
  setupFiles: ['react-native-gesture-handler/jestSetup', './jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|@shopify/flash-list|react-native-toast-message|react-native-gesture-handler|react-native-reanimated|react-native-worklets|react-native-drawer-layout|@reduxjs/toolkit|react-redux|redux|reselect|immer|mobx|mobx-react-lite|@react-native-async-storage/async-storage|@noble/hashes|react-native-error-boundary)/)',
  ],
};
