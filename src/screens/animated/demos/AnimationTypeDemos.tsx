import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, useAnimatedValue } from 'react-native';
import { useTheme } from '../../../theme';
import {
  Box,
  Button,
  Chips,
  DemoCard,
  Note,
  play,
  Row,
  Track,
  useTravel,
  ValueLabel,
} from '../ui';

const DURATIONS = ['300 ms', '1000 ms', '2500 ms'] as const;
type Duration = (typeof DURATIONS)[number];

/** Animated.timing: from the current value to toValue in a fixed time. */
export function TimingDemo() {
  const { t } = useTranslation('animated');
  const value = useAnimatedValue(0);
  const travel = useTravel();
  const [duration, setDuration] = useState<Duration>('1000 ms');
  const [atEnd, setAtEnd] = useState(false);

  const run = () => {
    const toValue = atEnd ? 0 : travel;
    setAtEnd(!atEnd);
    play(
      'timing',
      Animated.timing(value, {
        toValue,
        duration: parseInt(duration, 10),
        easing: Easing.inOut(Easing.ease), // the default easing
        delay: 0,
        useNativeDriver: true,
      }),
    );
  };

  return (
    <DemoCard
      title="Animated.timing"
      api="Animated.timing(v, { toValue, duration, easing, delay, useNativeDriver })"
      description={t('timing.description')}
    >
      <Track>
        <Box style={{ transform: [{ translateX: value }] }} />
      </Track>
      <Chips options={DURATIONS} value={duration} onChange={setDuration} />
      <Button
        label={atEnd ? t('timing.animateBack') : t('timing.animate')}
        onPress={run}
      />
    </DemoCard>
  );
}

const SPRING_MODES = [
  'bounciness / speed',
  'tension / friction',
  'stiffness / damping / mass',
] as const;
type SpringMode = (typeof SPRING_MODES)[number];

type SpringConfig = {
  bounciness?: number;
  speed?: number;
  tension?: number;
  friction?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
};

/** The three ways (mutually exclusive) to configure a spring. */
const SPRING_CONFIGS: Record<SpringMode, SpringConfig> = {
  'bounciness / speed': { bounciness: 18, speed: 8 },
  'tension / friction': { tension: 40, friction: 3 },
  'stiffness / damping / mass': { stiffness: 120, damping: 6, mass: 1 },
};

/** Animated.spring: physics-based, no fixed duration. */
export function SpringDemo() {
  const { t } = useTranslation('animated');
  const { colors } = useTheme();
  const value = useAnimatedValue(0);
  const travel = useTravel();
  const [mode, setMode] = useState<SpringMode>('bounciness / speed');
  const [atEnd, setAtEnd] = useState(false);

  const run = () => {
    const toValue = atEnd ? 0 : travel;
    setAtEnd(!atEnd);
    play(
      `spring (${mode})`,
      Animated.spring(value, {
        toValue,
        ...SPRING_CONFIGS[mode],
        velocity: 0,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        useNativeDriver: true,
      }),
    );
  };

  return (
    <DemoCard
      title="Animated.spring"
      api="Animated.spring(v, { toValue, ...config, useNativeDriver })"
      description={t('spring.description')}
    >
      <Track>
        <Box
          color={colors.pink}
          style={{ transform: [{ translateX: value }] }}
        />
      </Track>
      <Chips options={SPRING_MODES} value={mode} onChange={setMode} />
      <Note>{JSON.stringify(SPRING_CONFIGS[mode])}</Note>
      <Button
        label={atEnd ? t('spring.springBack') : t('spring.spring')}
        onPress={run}
      />
    </DemoCard>
  );
}

const VELOCITIES = ['0.3', '0.6', '1.0'] as const;
const DECELERATIONS = ['0.997', '0.99', '0.98'] as const;

/** Animated.decay: starts with a velocity and slows down until it stops. */
export function DecayDemo() {
  const { t } = useTranslation('animated');
  const { colors } = useTheme();
  const value = useAnimatedValue(0);
  const [velocity, setVelocity] = useState<(typeof VELOCITIES)[number]>('0.6');
  const [deceleration, setDeceleration] =
    useState<(typeof DECELERATIONS)[number]>('0.997');

  const throwBox = () => {
    value.setValue(0);
    play(
      'decay',
      Animated.decay(value, {
        velocity: Number(velocity), // px per ms
        deceleration: Number(deceleration),
        useNativeDriver: true,
      }),
    );
  };

  return (
    <DemoCard
      title="Animated.decay"
      api="Animated.decay(v, { velocity, deceleration, useNativeDriver })"
      description={t('decay.description')}
    >
      <Track>
        <Box
          color={colors.amber}
          style={{ transform: [{ translateX: value }] }}
        />
      </Track>
      <ValueLabel value={value} label="x" digits={0} />
      <Note>velocity (px/ms)</Note>
      <Chips options={VELOCITIES} value={velocity} onChange={setVelocity} />
      <Note>deceleration</Note>
      <Chips
        options={DECELERATIONS}
        value={deceleration}
        onChange={setDeceleration}
      />
      <Row>
        <Button label={t('decay.throw')} onPress={throwBox} />
      </Row>
    </DemoCard>
  );
}
