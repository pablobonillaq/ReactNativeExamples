/**
 * Reanimated's official Jest mock, plus the values it fails to provide.
 *
 * lib/module/mock.js re-exports enums, spring configs, isSharedValue and CSS
 * helpers from Reanimated's own index, but in Jest they arrive undefined. The
 * app uses some at module level (e.g. `SensorType.GRAVITY` in a constant) and
 * Gesture Handler 3 calls `isSharedValue` on every gesture, so both crash.
 * Each fallback below copies the value from Reanimated 4.7's source and is
 * used only when the mock's value is missing.
 */
const mock = require('react-native-reanimated/lib/module/mock');

const fallbacks = {
  // src/commonTypes.ts
  SensorType: {
    ACCELEROMETER: 1,
    GYROSCOPE: 2,
    GRAVITY: 3,
    MAGNETIC_FIELD: 4,
    ROTATION: 5,
  },
  IOSReferenceFrame: {
    XArbitraryZVertical: 0,
    XArbitraryCorrectedZVertical: 1,
    XMagneticNorthZVertical: 2,
    XTrueNorthZVertical: 3,
    Auto: 4,
  },
  InterfaceOrientation: {
    ROTATION_0: 0,
    ROTATION_90: 90,
    ROTATION_180: 180,
    ROTATION_270: 270,
  },
  KeyboardState: { UNKNOWN: 0, OPENING: 1, OPEN: 2, CLOSING: 3, CLOSED: 4 },
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
  // src/interpolation.ts
  Extrapolation: { IDENTITY: 'identity', CLAMP: 'clamp', EXTEND: 'extend' },
  // src/animation/spring/springConfigs.ts
  Reanimated3DefaultSpringConfig: { damping: 10, mass: 1, stiffness: 100 },
  Reanimated3DefaultSpringConfigWithDuration: {
    duration: 1333,
    dampingRatio: 0.5,
  },
  WigglySpringConfig: { damping: 90, mass: 4, stiffness: 900 },
  WigglySpringConfigWithDuration: { duration: 550, dampingRatio: 0.75 },
  GentleSpringConfig: { damping: 120, mass: 4, stiffness: 900 },
  GentleSpringConfigWithDuration: { duration: 550, dampingRatio: 1 },
  SnappySpringConfig: {
    damping: 110,
    mass: 4,
    stiffness: 900,
    overshootClamping: true,
  },
  SnappySpringConfigWithDuration: {
    duration: 550,
    dampingRatio: 0.92,
    overshootClamping: true,
  },
  // src/isSharedValue.ts (Gesture Handler 3 calls it for every gesture config)
  isSharedValue: value => value?._isReanimatedSharedValue === true,
  // CSS helpers: their CSS string form is enough in tests.
  steps: (n, position = 'jump-end') => `steps(${n}, ${position})`,
  cubicBezier: (x1, y1, x2, y2) => `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`,
  linear: (...points) => `linear(${points.join(', ')})`,
  reanimatedVersion: '4.7.0',
};

const result = { ...mock };
for (const [name, value] of Object.entries(fallbacks)) {
  result[name] = mock[name] ?? value;
}
result.Extrapolate = result.Extrapolation;
result.css = {
  ...mock.css,
  create: mock.css?.create ?? (styles => styles),
  keyframes: mock.css?.keyframes ?? (frames => frames),
};

module.exports = result;
