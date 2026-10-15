import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  GentleSpringConfig,
  Reanimated3DefaultSpringConfig,
  SnappySpringConfig,
  useAnimatedStyle,
  useSharedValue,
  WigglySpringConfig,
  withDecay,
  withSpring,
  withTiming,
  type WithSpringConfig,
} from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../../theme';
import {
  BOX,
  Button,
  Chips,
  DemoCard,
  logDemo,
  logEnd,
  Note,
  RBox,
  Row,
  SharedValueLabel,
  Track,
  useTravel,
} from '../ui';

type EasingFunction = (t: number) => number;

/** Every Reanimated easing. `fixed` curves ignore in / out / inOut. */
const EASINGS: Record<
  string,
  { fn: EasingFunction; code: string; fixed?: boolean }
> = {
  linear: { fn: Easing.linear, code: 'Easing.linear', fixed: true },
  ease: { fn: Easing.ease, code: 'Easing.ease' },
  quad: { fn: Easing.quad, code: 'Easing.quad' },
  cubic: { fn: Easing.cubic, code: 'Easing.cubic' },
  'poly(5)': { fn: Easing.poly(5), code: 'Easing.poly(5)' },
  sin: { fn: Easing.sin, code: 'Easing.sin' },
  circle: { fn: Easing.circle, code: 'Easing.circle' },
  exp: { fn: Easing.exp, code: 'Easing.exp' },
  'elastic(2)': { fn: Easing.elastic(2), code: 'Easing.elastic(2)' },
  'back(2)': { fn: Easing.back(2), code: 'Easing.back(2)' },
  bounce: { fn: Easing.bounce, code: 'Easing.bounce' },
  bezierFn: {
    fn: Easing.bezierFn(0.68, -0.55, 0.27, 1.55),
    code: 'Easing.bezier(0.68, -0.55, 0.27, 1.55)',
    fixed: true,
  },
  'steps(5)': { fn: Easing.steps(5), code: 'Easing.steps(5)', fixed: true },
};
const EASING_NAMES = Object.keys(EASINGS);
const MODES = ['in', 'out', 'inOut'] as const;
type Mode = (typeof MODES)[number];

/** withTiming: duration + easing. */
export function TimingDemo() {
  const { t } = useTranslation('reanimated');
  const { colors } = useTheme();
  const x = useSharedValue(0);
  const travel = useTravel();
  const [name, setName] = useState('bounce');
  const [mode, setMode] = useState<Mode>('out');
  const curve = EASINGS[name];
  const easing = curve.fixed ? curve.fn : Easing[mode](curve.fn);
  const code = curve.fixed ? curve.code : `Easing.${mode}(${curve.code})`;

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <DemoCard
      title={t('timing.title')}
      api={`withTiming(toValue, { duration: 1200, easing: ${code} })`}
      description={t('timing.description')}
    >
      <Track>
        <RBox color={colors.sky} style={style} />
      </Track>
      <Chips options={EASING_NAMES} value={name} onChange={setName} />
      {curve.fixed ? (
        <Note>{t('timing.fixedNote')}</Note>
      ) : (
        <Chips options={MODES} value={mode} onChange={setMode} />
      )}
      <Button
        label={t('common.play')}
        onPress={() => {
          logDemo('withTiming', { easing: code });
          x.value = 0;
          x.value = withTiming(
            travel,
            { duration: 1200, easing },
            logEnd('withTiming'),
          );
        }}
      />
    </DemoCard>
  );
}

const SPRINGS: Record<string, { config: WithSpringConfig; code: string }> = {
  'stiffness/damping': {
    config: { stiffness: 120, damping: 8, mass: 1 },
    code: '{ stiffness: 120, damping: 8, mass: 1 }',
  },
  'duration/dampingRatio': {
    config: { duration: 1200, dampingRatio: 0.4 },
    code: '{ duration: 1200, dampingRatio: 0.4 }',
  },
  overshootClamping: {
    config: { stiffness: 200, damping: 5, overshootClamping: true },
    code: '{ stiffness: 200, damping: 5, overshootClamping: true }',
  },
  Reanimated3Default: {
    config: Reanimated3DefaultSpringConfig,
    code: 'Reanimated3DefaultSpringConfig',
  },
  Wiggly: { config: WigglySpringConfig, code: 'WigglySpringConfig' },
  Gentle: { config: GentleSpringConfig, code: 'GentleSpringConfig' },
  Snappy: { config: SnappySpringConfig, code: 'SnappySpringConfig' },
};
const SPRING_NAMES = Object.keys(SPRINGS);

/** withSpring: physics, configured by stiffness/damping or duration. */
export function SpringDemo() {
  const { t } = useTranslation('reanimated');
  const { colors } = useTheme();
  const x = useSharedValue(0);
  const travel = useTravel();
  const [name, setName] = useState('stiffness/damping');
  const spring = SPRINGS[name];

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <DemoCard
      title={t('spring.title')}
      api={`withSpring(toValue, ${spring.code})`}
      description={t('spring.description')}
    >
      <Track>
        <RBox color={colors.pink} style={style} />
      </Track>
      <Chips options={SPRING_NAMES} value={name} onChange={setName} />
      <Button
        label={t('spring.button')}
        onPress={() => {
          logDemo('withSpring', { config: name });
          x.value = withSpring(
            x.value > travel / 2 ? 0 : travel,
            spring.config,
            logEnd('withSpring'),
          );
        }}
      />
    </DemoCard>
  );
}

const DECAYS = ['plain', 'clamp', 'rubberBand'] as const;
type DecayMode = (typeof DECAYS)[number];

/** withDecay: starts with a velocity and slows down. */
export function DecayDemo() {
  const { t } = useTranslation('reanimated');
  const { colors } = useTheme();
  const x = useSharedValue(0);
  const travel = useTravel();
  const [mode, setMode] = useState<DecayMode>('rubberBand');

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const fling = () => {
    logDemo('withDecay', { mode });
    x.value = 0;
    const base = { velocity: 1600, deceleration: 0.997 };
    // clamp keeps it inside the track; rubberBandEffect bounces back at
    // the edges instead of stopping hard.
    if (mode === 'clamp') {
      x.value = withDecay({ ...base, clamp: [0, travel] }, logEnd('decay'));
    } else if (mode === 'rubberBand') {
      x.value = withDecay(
        {
          ...base,
          clamp: [0, travel],
          rubberBandEffect: true,
          rubberBandFactor: 0.6,
        },
        logEnd('decay'),
      );
    } else {
      x.value = withDecay(base, logEnd('decay'));
    }
  };

  return (
    <DemoCard
      title={t('decay.title')}
      api="withDecay({ velocity, deceleration, clamp: [0, W], rubberBandEffect })"
      description={t('decay.description')}
    >
      <Track>
        <RBox color={colors.amber} style={style} />
      </Track>
      <SharedValueLabel value={x} label="x" digits={0} />
      <Chips options={DECAYS} value={mode} onChange={setMode} />
      <Row>
        <Button label={t('decay.fling')} onPress={fling} />
      </Row>
    </DemoCard>
  );
}

/** Any style or number can be animated, including colors. */
export function AnimatableValuesDemo() {
  const { t } = useTranslation('reanimated');
  const { colors } = useTheme();
  const [on, setOn] = useState(false);
  const color = useSharedValue(colors.primary);
  const radius = useSharedValue(6);
  const size = useSharedValue(BOX);

  const style = useAnimatedStyle(() => ({
    backgroundColor: color.value,
    borderRadius: radius.value,
    width: size.value,
    height: size.value,
  }));

  // The color follows `on` and the theme (switching light / dark animates
  // it to the new theme's color too).
  useEffect(() => {
    color.value = withTiming(on ? colors.pink : colors.primary, {
      duration: 600,
    });
  }, [color, on, colors.pink, colors.primary]);

  return (
    <DemoCard
      title={t('animatable.title')}
      api="color.value = withTiming('#db2777'); size.value = withSpring(80)"
      description={t('animatable.description')}
    >
      <View style={styles.center}>
        <Animated.View style={style} />
      </View>
      <Button
        label={on ? t('animatable.back') : t('animatable.change')}
        onPress={() => {
          setOn(!on);
          radius.value = withTiming(on ? 6 : 40, { duration: 600 });
          size.value = withSpring(on ? BOX : 80);
        }}
      />
    </DemoCard>
  );
}

const styles = StyleSheet.create({
  center: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
