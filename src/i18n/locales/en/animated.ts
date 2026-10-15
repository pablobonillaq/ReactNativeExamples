/** English texts: animated. Keys are used with useTranslation('animated'). */
const animated = {
  intro:
    "Every option of React Native's core Animated API. Each card shows the call it uses; press the buttons to see it move.",
  sections: {
    values: {
      title: '1. Values',
      subtitle: 'What gets animated: numbers outside React state.',
    },
    types: {
      title: '2. Animation types',
      subtitle: 'How a value moves from A to B.',
    },
    easing: {
      title: '3. Easing',
      subtitle: 'The shape of a timing animation.',
    },
    composition: {
      title: '4. Composition',
      subtitle: 'Run several animations together or in order.',
    },
    interpolation: {
      title: '5. Interpolation',
      subtitle: 'Turn one value into positions, angles, colors…',
    },
    combining: {
      title: '6. Combining values',
      subtitle: 'Math between animated values.',
    },
    events: {
      title: '7. Events and gestures',
      subtitle: 'Feed scroll and touch straight into values.',
    },
    nativeDriver: {
      title: '8. Native driver',
      subtitle: 'Where the animation runs: JS thread or UI thread.',
    },
    components: {
      title: '9. Animated components',
      subtitle: 'Which components accept animated values.',
    },
    reference: {
      title: 'API reference',
      subtitle: 'Everything above, at a glance.',
    },
  },
  scroll: {
    title: 'Scroll: Animated.event',
    description:
      'The purple bar at the top of this screen is scaleX = scrollY interpolated to 0 → 1 (clamped).',
    direction: "listener says you're scrolling {{direction}}",
    up: 'up',
    down: 'down',
  },
  reference: {
    values: 'Values',
    valuesGestures: 'Values, Gestures',
    valueLabels: 'Values (value labels)',
    valuesComposition: 'Values, Composition',
    types: 'Animation types',
    typesGestures: 'Animation types, Gestures',
    easing: 'Easing',
    composition: 'Composition',
    interpolation: 'Interpolation',
    combining: 'Combining values',
    events: 'Events (progress bar)',
    gestures: 'Gestures',
    nativeDriver: 'Native driver',
    everywhere: 'Everywhere',
    sameAsView: 'Same as View, for those components',
    components: 'Components',
    advanced:
      'Advanced: add or attach extra handlers to an Animated.event (used by libraries)',
  },
  value: {
    description:
      'A number that lives outside React state: changing it moves the view without re-rendering. setValue jumps; animations move it over time. The offset is added on top of the value (value + offset); flattenOffset merges it in.',
  },
  valueXY: {
    description:
      'Pairs two Animated.Values. getTranslateTransform() turns it into [{ translateX }, { translateY }]; getLayout() into { left, top }.',
    random: 'Random point (spring)',
  },
  color: {
    description:
      "A color whose r, g, b and a channels are Animated.Values. setValue('blue') jumps; animating the channels blends.",
    names: {
      indigo: 'indigo',
      pink: 'pink',
      green: 'green',
      amber: 'amber',
    },
  },
  control: {
    title: 'Controlling a running animation',
    description:
      'The value label below uses addListener. stopAnimation freezes the value where it is and gives it back in a callback; resetAnimation returns it to where it started.',
    start: 'Start',
    messages: {
      idle: 'Press start: it takes 4 s',
      running: 'Running…',
      finished: 'Finished (finished: true)',
      interrupted: 'Interrupted (finished: false)',
      stopped: 'Stopped at {{value}}',
      reset: 'Reset to {{value}}',
      animReset: 'animation.reset(): back to the start value',
    },
    note: 'Starting a new animation on a value stops the one running on it.',
  },
  timing: {
    description:
      'Goes to toValue in exactly `duration` ms following an easing curve. The most common animation.',
    animate: 'Animate',
    animateBack: 'Animate back',
  },
  spring: {
    description:
      'Simulates a spring: it overshoots and settles. Use only one of the three configurations.',
    spring: 'Spring',
    springBack: 'Spring back',
  },
  decay: {
    description:
      'No target value: it keeps moving and slows down, like a flicked list. Typically fed with the velocity of a gesture.',
    throw: 'Throw',
  },
  easing: {
    description:
      'An easing maps time (0→1) to progress (0→1). Easing.in / out / inOut flip or mirror any curve.',
    fixed: "This curve is used as is (in / out don't apply).",
    play: 'Play 1.2 s',
  },
  sequence: {
    description:
      "Starts each animation when the previous one finishes. If one is stopped, the rest don't run.",
    play: 'Play sequence',
  },
  parallel: {
    description:
      'Starts all of them at the same time (here with different durations). With stopTogether: true, stopping one stops all.',
    play: 'Play parallel',
    stopLane: 'Stop lane 1',
  },
  stagger: {
    description:
      'Like parallel, but each animation starts 120 ms after the previous one. Great for lists and menus.',
    up: 'Stagger up',
    down: 'Stagger down',
  },
  delay: {
    description:
      'An animation that does nothing for the given time. Also available as the `delay` option of timing and spring.',
    run: 'Go, wait 1 s, come back',
  },
  loop: {
    description:
      'Repeats the animation; iterations: -1 means forever. With the native driver the loop runs entirely on the UI thread.',
    infinite: 'infinite',
    start: 'Start loop',
    stop: 'Stop',
  },
  interpolate: {
    description:
      "Maps ranges: numbers, angles ('360deg'), colors (hex / rgb) and several stops. One value moves, rotates, scales, recolors and rounds the box.",
    toOne: 'Animate to 1',
    toZero: 'Back to 0',
  },
  extrapolate: {
    description:
      'The value goes from 0 to 2, but the inputRange ends at 1. The dashed line is where 1 lands.',
    note: 'extend keeps going, clamp stops at the last output, identity returns the raw input (here 0 → 2 px, so it barely moves).',
    hint: 'extrapolateLeft / extrapolateRight set each side separately.',
    run: 'Animate 0 → 2 → 0',
  },
  math: {
    title: 'Combining values',
    description:
      'Every box below is driven by the same x (0 → W → 0). The black one is x itself.',
    mirrored: 'mirrored',
    wraps: 'wraps',
    note: "diffClamp follows the changes of x but never leaves [0, 60]: when x turns around it reacts at once. It's the trick behind headers that hide on scroll down and show on scroll up.",
    run: 'Animate x',
  },
  drag: {
    title: 'Drag: Animated.event + PanResponder',
    description:
      'Animated.event writes gesture or scroll values straight into Animated values. Drag the box; it stays where you drop it.',
    box: 'drag',
    reset: 'Reset position',
  },
  throw: {
    title: 'Throw: gesture velocity + decay + spring',
    description:
      'Fling the ball: it keeps the speed of your finger, slows down and springs back.',
    note: "PanResponder runs on the JS thread, so Animated.event can't use the native driver here. react-native-gesture-handler + Reanimated move gestures to the UI thread.",
  },
  nativeDriver: {
    description:
      'Start both, then block the JS thread for 2 seconds: the JS-driven box freezes, the native-driven one keeps moving.',
    jsTrack: 'useNativeDriver: false (JS thread)',
    nativeTrack: 'useNativeDriver: true (UI thread)',
    blocking: 'Blocking the JS thread…',
    stop: 'Stop',
    start: 'Start both',
    block: 'Block JS for 2 s',
    note: 'The native driver supports non-layout props: transform and opacity (plus colors on recent versions). width, height, margin, top/left… need useNativeDriver: false.',
  },
  createComponent: {
    description:
      'Built in: Animated.View, Text, Image, ScrollView, FlatList and SectionList. Anything else goes through createAnimatedComponent.',
    pressMe: 'Press me ({{presses}})',
  },
  text: {
    description:
      'Text props that change layout (fontSize, letterSpacing) only work with useNativeDriver: false.',
    grow: 'Grow',
    shrink: 'Shrink',
    note: "Animated values can't be printed as text: use addListener.",
  },
};

export default animated;
