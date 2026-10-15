/** English texts: reanimated. Keys are used with useTranslation('reanimated'). */
const reanimated = {
  common: {
    play: 'Play',
    pause: 'Pause',
    start: 'Start',
    stop: 'Stop',
    reset: 'Reset',
    animate: 'Animate',
    add: 'Add',
    remove: 'Remove',
  },
  screen: {
    intro:
      'The whole Reanimated 3 API, running on Reanimated {{version}} (v4 keeps every v3 function). Gestures use Gesture Handler 3. Everything animates on the UI thread.',
    sections: {
      sharedValues: {
        title: '1. Shared values & hooks',
        subtitle: 'State that lives on the UI thread.',
      },
      animations: {
        title: '2. Animations',
        subtitle: 'How a value gets to its target.',
      },
      modifiers: {
        title: '3. Modifiers',
        subtitle: 'Combine, repeat, delay and limit animations.',
      },
      interpolation: {
        title: '4. Interpolation',
        subtitle: 'Map values to positions, angles and colors.',
      },
      gestures: {
        title: '5. Gestures',
        subtitle: 'Gesture Handler 3 hooks + shared values.',
      },
      scroll: {
        title: '6. Scroll',
        subtitle: 'Scroll events and native refs in worklets.',
      },
      layout: {
        title: '7. Layout animations',
        subtitle: 'Animate mounting, unmounting and layout changes.',
      },
      threads: {
        title: '8. Threads',
        subtitle: 'Worklets, frames and the UI thread.',
      },
      device: {
        title: '9. Device',
        subtitle: 'Sensors and keyboard as shared values.',
      },
      extras: {
        title: '10. Reanimated 4 extras',
        subtitle: 'Not in Reanimated 3: CSS-style animations.',
      },
      reference: {
        title: 'API reference',
        subtitle: 'Everything above, at a glance.',
      },
    },
  },
  reference: {
    rows: {
      sharedValue: {
        api: 'useSharedValue · .value · get() · set() · modify()',
        where: '1. Shared values',
      },
      animatedStyle: { api: 'useAnimatedStyle', where: 'Everywhere' },
      derivedValue: { api: 'useDerivedValue', where: '1. Shared values' },
      animatedReaction: {
        api: 'useAnimatedReaction',
        where: '1. Shared values (and every value label)',
      },
      animatedProps: {
        api: 'useAnimatedProps · createAnimatedComponent',
        where: '1. Shared values',
      },
      timing: {
        api: 'withTiming + Easing.* (in / out / inOut, bezier, steps)',
        where: '2. Animations',
      },
      spring: {
        api: 'withSpring (stiffness/damping, duration/dampingRatio, presets)',
        where: '2. Animations',
      },
      decay: {
        api: 'withDecay (clamp, rubberBandEffect)',
        where: '2. Animations, 5. Gestures',
      },
      animatable: {
        api: 'Animating colors and layout (width / height)',
        where: '2. Animations',
      },
      modifiers: {
        api: 'withSequence · withRepeat · withDelay · withClamp',
        where: '3. Modifiers',
      },
      cancel: {
        api: 'cancelAnimation · animation callbacks (finished)',
        where: '3. Modifiers',
      },
      reduceMotion: {
        api: 'ReduceMotion · useReducedMotion · ReducedMotionConfig',
        where: '3. Modifiers',
      },
      interpolate: {
        api: 'interpolate · Extrapolation · clamp',
        where: '4. Interpolation',
      },
      interpolateColor: {
        api: 'interpolateColor (RGB / HSV / LAB)',
        where: '4. Interpolation',
      },
      gestures: {
        api: 'usePanGesture · useTapGesture · useLongPressGesture',
        where: '5. Gestures (RNGH 3)',
      },
      pinchRotate: {
        api: 'usePinchGesture · useRotationGesture',
        where: '5. Gestures (RNGH 3)',
      },
      combineGestures: {
        api: 'useExclusiveGestures · useSimultaneousGestures',
        where: '5. Gestures (RNGH 3)',
      },
      scrollHandler: {
        api: 'useAnimatedScrollHandler (all phases + context)',
        where: '6. Scroll, this screen',
      },
      scrollRefs: {
        api: 'useAnimatedRef · useScrollOffset · scrollTo · measure',
        where: '6. Scroll',
      },
      entering: {
        api: 'entering / exiting presets + modifiers',
        where: '7. Layout animations',
      },
      layoutTransitions: {
        api: 'layout transitions (Linear, Sequenced, Fading, Jumping, Curved, EntryExit)',
        where: '7. Layout animations',
      },
      keyframe: {
        api: 'Keyframe · LayoutAnimationConfig',
        where: '7. Layout animations',
      },
      frameCallback: { api: 'useFrameCallback', where: '8. Threads' },
      runOn: { api: "runOnUI · runOnJS · 'worklet'", where: '8. Threads' },
      uiThread: { api: 'UI thread vs JS thread', where: '8. Threads' },
      sensor: { api: 'useAnimatedSensor', where: '9. Device' },
      keyboard: { api: 'useAnimatedKeyboard', where: '9. Device' },
      css: {
        api: 'CSS transitions · CSS animations · css.keyframes',
        where: '10. Reanimated 4 extras',
      },
      notShown: {
        api: 'Not shown: shared element transitions (experimental), useEvent / useHandler (custom events), createWorkletRuntime, PerformanceMonitor',
        where: 'Advanced / experimental',
      },
    },
  },

  // ---------- 1. Shared values ----------
  sharedValue: {
    title: 'useSharedValue + useAnimatedStyle',
    description:
      'A shared value lives on both threads. Assigning .value (or calling set) updates the style on the UI thread without re-rendering React. get()/set() are the React-Compiler-friendly versions of .value.',
  },
  derivedValue: {
    title: 'useDerivedValue',
    description:
      'Like useMemo, but for shared values and on the UI thread. Both boxes below are derived from x.',
    animate: 'Animate x',
  },
  animatedReaction: {
    title: 'useAnimatedReaction + runOnJS',
    description:
      'Runs a side effect when something on the UI thread changes. Here it counts every time the box crosses the middle.',
    crossed_one: 'Crossed the middle {{count}} time',
    crossed_other: 'Crossed the middle {{count}} times',
    move: 'Move',
    note: 'runOnJS is the Reanimated 3 name; Reanimated 4 also offers scheduleOnRN from react-native-worklets.',
  },
  animatedProps: {
    title: 'useAnimatedProps',
    description:
      'Animates props instead of styles. A counter that renders 60 times per second without React re-rendering.',
    count: 'Count to 1000',
  },

  // ---------- 2. Animations ----------
  timing: {
    title: 'withTiming',
    description:
      'Goes to toValue in a fixed time following an easing curve (default: Easing.inOut(Easing.quad), 300 ms).',
    fixedNote: "This curve is used as is (in / out don't apply).",
  },
  spring: {
    title: 'withSpring',
    description:
      'Physics-based. Configure it with stiffness/damping/mass, or with duration/dampingRatio, or use one of the presets.',
    button: 'Spring',
  },
  decay: {
    title: 'withDecay',
    description:
      "No target: it keeps the starting velocity (px/s) and slows down. Usually fed with a gesture's velocity on release (see Gestures).",
    fling: 'Fling at 1600 px/s',
  },
  animatable: {
    title: 'What can be animated',
    description:
      "Numbers, colors (strings), and layout props like width / height (unlike Animated's native driver, Reanimated animates layout on the UI thread).",
    back: 'Back',
    change: 'Change color, radius and size',
  },

  // ---------- 3. Modifiers ----------
  sequence: {
    title: 'withSequence',
    description: 'Runs the animations in order on the same shared value.',
    play: 'Play sequence',
  },
  repeat: {
    title: 'withRepeat + cancelAnimation',
    description:
      '-1 repeats forever; `true` plays it back and forth. cancelAnimation stops whatever is running on a value.',
  },
  delay: {
    title: 'withDelay',
    description:
      'Wraps any animation and starts it after the given ms. With different delays it creates a stagger.',
    stagger: 'Stagger with withDelay',
  },
  clamp: {
    title: 'withClamp',
    description:
      'The same bouncy spring, with and without clamping. The clamped one never passes the limit.',
    springBoth: 'Spring both',
  },
  reduceMotion: {
    title: 'ReduceMotion',
    description:
      "With 'Remove animations' on in the OS, animations using ReduceMotion.System jump straight to the end. Always / Never override it.",
    status: 'useReducedMotion(): {{value}}',
    reduced: 'true (reduced)',
    note: 'Wrap a tree in <ReducedMotionConfig mode={…} /> to set it for every animation inside.',
  },

  // ---------- 4. Interpolation ----------
  interpolate: {
    title: 'interpolate',
    description:
      'A plain function you call inside a worklet: maps a number from one range to another. Angles are built as strings.',
  },
  extrapolation: {
    title: 'Extrapolation',
    description:
      'The value goes 0 → 2 but the inputRange ends at 1 (dashed line). EXTEND keeps going, CLAMP stops, IDENTITY returns the raw input.',
    animate: 'Animate 0 → 2',
    note: 'Each side can differ: { extrapolateLeft: CLAMP, extrapolateRight: EXTEND }.',
  },
  interpolateColor: {
    title: 'interpolateColor',
    description:
      'Red → blue through three color spaces. RGB goes through a muddy purple, HSV through the rainbow, LAB looks the most even.',
    blend: 'Blend',
  },
  clampFunction: {
    title: 'clamp',
    description:
      'A helper for worklets. x runs across the whole track, but the box stays between the two lines.',
    run: 'Run x from 0 to W',
  },

  // ---------- 5. Gestures ----------
  panDecay: {
    title: 'Pan + withDecay',
    description:
      'Drag and fling the ball. Every callback is a worklet: the gesture never touches the JS thread.',
    note: 'A spring inside useAnimatedStyle (scale) animates automatically when the value it depends on changes.',
  },
  tap: {
    title: 'Tap / double tap / long press',
    description:
      'Exclusive: the first gesture wins if it can; the next ones wait for it to fail. useSimultaneousGestures and useCompetingGestures are the other two ways to combine.',
    results: {
      initial: 'Tap, double tap or long press the box',
      singleTap: 'Single tap → bounce',
      doubleTap: 'Double tap → spin',
      longPress: 'Long press (500 ms) → color',
    },
  },
  pinchRotate: {
    title: 'Pinch + rotate + pan (simultaneous)',
    description:
      'Use two fingers to zoom and rotate, one to move. On the emulator: hold Ctrl (Cmd on Mac) and drag to pinch.',
  },

  // ---------- 6. Scroll ----------
  scrollHandler: {
    title: 'useAnimatedScrollHandler',
    description:
      'Each handler is a worklet. The context object is shared between them (here: where the drag started).',
    phases: {
      swipe: 'Swipe the cards',
      beginDrag: 'onBeginDrag',
      endDrag: 'onEndDrag: dragged {{value}} px',
      momentumBegin: 'onMomentumBegin',
      momentumEnd: 'onMomentumEnd: card {{value}}',
    },
  },
  scrollTo: {
    title: 'useAnimatedRef · useScrollOffset · scrollTo · measure',
    description:
      'An animated ref gives worklets access to the native view: read its scroll position, scroll it, or measure it without a JS round trip.',
    row: 'Row {{number}}',
    top: 'scrollTo top',
    measureMe: 'measure me',
    note: 'measure returns screen coordinates (pageX / pageY) and size.',
  },

  // ---------- 7. Layout animations ----------
  enteringExiting: {
    title: 'entering / exiting',
    description:
      'Layout animations run when the view is added or removed from the tree. No shared values needed.',
    remove: 'Remove (exiting)',
    add: 'Add (entering)',
  },
  layoutTransition: {
    title: 'Layout transitions',
    description:
      'When an item is added or removed, the others move to their new place with the chosen transition. Tap an item to remove it.',
    addAtStart: 'Add at start',
    shuffle: 'Shuffle',
  },
  keyframe: {
    title: 'Keyframe',
    description:
      'Your own layout animation, defined as CSS-like keyframes. Each step can have its own easing.',
  },
  layoutAnimationConfig: {
    title: 'LayoutAnimationConfig',
    description:
      "Useful for lists whose items shouldn't animate on the first render. Remount the row to compare.",
    remount: 'Remount',
    note: "Shared element transitions (sharedTransitionTag) are experimental in Reanimated 4 and need a feature flag, so they aren't shown here.",
  },

  // ---------- 8. Threads ----------
  frameCallback: {
    title: 'useFrameCallback',
    description:
      'A worklet called on every frame with timing info. Here: gravity and bounces computed by hand, 60+ times per second, on the UI thread.',
  },
  threadHop: {
    title: "runOnUI · runOnJS · 'worklet'",
    description:
      "Worklets are functions marked with 'worklet' (or used inside Reanimated hooks): they can run on the UI thread. runOnJS calls back into React.",
    pressTheButton: 'Press the button',
    result: 'UI thread computed {{value}} (worklet ran on: {{thread}})',
    runs: 'runs',
    sum: 'Sum 1…1000 on the UI thread',
    note: 'Reanimated 4 also exports scheduleOnUI / scheduleOnRN from react-native-worklets, and createWorkletRuntime for background runtimes.',
  },
  uiThread: {
    title: 'UI thread vs JS thread',
    description:
      'Start both, then block JavaScript for 2 seconds. The Reanimated box keeps moving; the one driven by React state freezes.',
    jsLane: 'React state + setInterval (JS thread)',
    uiLane: 'Reanimated (UI thread)',
    blocking: 'Blocking the JS thread…',
    startBoth: 'Start both',
    block: 'Block JS for 2 s',
  },

  // ---------- 9. Device ----------
  sensor: {
    title: 'useAnimatedSensor',
    description:
      'Tilt the phone to roll the ball. Sensor readings arrive on the UI thread, ready for animated styles. ROTATION gives yaw / pitch / roll instead of x / y / z.',
    available: 'Sensor available',
    notAvailable: 'Sensor not available here',
    note: 'On the emulator: ⋯ (Extended controls) → Virtual sensors → move the device.',
  },
  keyboard: {
    title: 'useAnimatedKeyboard',
    description:
      'Follows the keyboard animation exactly (no keyboardWillShow events). Tap the input: the bar grows with the keyboard height.',
    placeholder: 'Tap to open the keyboard',
  },

  // ---------- 10. Reanimated 4 extras ----------
  cssTransition: {
    title: 'CSS transitions (Reanimated 4)',
    description:
      'Just change the style with React state: Reanimated animates the listed properties to the new value.',
    toggle: 'Toggle style',
  },
  cssAnimation: {
    title: 'CSS animations (Reanimated 4)',
    description:
      'Keyframes declared in the style, like CSS @keyframes. Play state, direction and iteration count are plain style props.',
    note: 'Not part of Reanimated 3: CSS animations and transitions were added in Reanimated 4.',
  },
};

export default reanimated;
