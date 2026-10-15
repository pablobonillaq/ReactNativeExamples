/* global jest */
// The drawer uses Reanimated 4, which runs on react-native-worklets. Their
// native modules don't exist in Jest, so both are replaced by their mocks.
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/lib/module/mock'),
);
// Reanimated's mock plus the enums / helpers it leaves undefined (see file).
jest.mock('react-native-reanimated', () =>
  require('./__mocks__/reanimatedMock'),
);
// AsyncStorage's official in-memory mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);
// op-sqlite replaced by Node's built-in SQLite (the SQL still runs for real).
jest.mock('@op-engineering/op-sqlite', () =>
  require('./__mocks__/opSqliteNodeMock'),
);
// Photo gallery: file system, device photos and camera are native-only.
jest.mock('@dr.pogodin/react-native-fs', () =>
  require('./__mocks__/reactNativeFsMock'),
);
jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: {
    getPhotos: jest.fn(async () => ({
      edges: [],
      page_info: { has_next_page: false },
    })),
  },
}));
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: () => undefined,
  useCameraPermission: () => ({
    hasPermission: false,
    canRequestPermission: true,
    requestPermission: jest.fn(async () => false),
  }),
  usePhotoOutput: () => ({ capturePhoto: jest.fn() }),
}));
// Buses map: MapLibre is a native map view; render nothing in tests.
jest.mock('@maplibre/maplibre-react-native', () => {
  const React = require('react');
  const Noop = ({ children }) => children ?? null;
  return {
    Map: Noop,
    Camera: React.forwardRef(() => null),
    GeoJSONSource: Noop,
    Layer: () => null,
    Marker: Noop,
  };
});
// Share & copy: native share sheet and clipboard.
jest.mock('react-native-share', () => ({ open: jest.fn(async () => ({})) }));
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  setImage: jest.fn(),
  getString: jest.fn(async () => ''),
  getImage: jest.fn(async () => ''),
}));
// Password vault: Keychain / Keystore replaced by an in-memory map.
jest.mock('react-native-keychain', () =>
  require('./__mocks__/reactNativeKeychainMock'),
);
// Sentry: native SDK not available in Jest; keep the API as no-ops.
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: component => component,
  ErrorBoundary: ({ children }) => children,
  reactNavigationIntegration: () => ({
    registerNavigationContainer: jest.fn(),
  }),
  createReduxEnhancer: () => next => next,
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(() => 'test-event-id'),
  captureMessage: jest.fn(() => 'test-event-id'),
  setTag: jest.fn(),
  setUser: jest.fn(),
  nativeCrash: jest.fn(),
  startSpan: jest.fn((_options, callback) => callback()),
  logger: {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));
// Firebase: native SDKs not available in Jest; same modular API as no-ops.
jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: () => ({}),
  log: jest.fn(),
  recordError: jest.fn(),
  setAttribute: jest.fn(async () => null),
  setAttributes: jest.fn(async () => null),
  setUserId: jest.fn(async () => null),
  setCrashlyticsCollectionEnabled: jest.fn(async () => null),
  crash: jest.fn(),
}));
jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: () => ({}),
  logEvent: jest.fn(async () => null),
  logScreenView: jest.fn(async () => null),
  setUserId: jest.fn(async () => null),
  setAnalyticsCollectionEnabled: jest.fn(async () => null),
}));
// Keep test output clean: the logger still records entries, but doesn't print.
require('./src/observability/logger').configureLogger({ consoleLevel: 'off' });
// Tests run in English with the settings already loaded (theme: system,
// which is light in Jest). Tests can switch with i18n.changeLanguage('es').
require('./src/i18n').default.changeLanguage('en');
require('./src/settings/settingsStore').resetSettingsForTests();
