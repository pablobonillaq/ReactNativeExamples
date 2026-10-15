import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, View, useAnimatedValue } from 'react-native';
import { makeStyles, useTheme } from '../../../theme';
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
} from '../ui';

/** Three Animated.Values that survive re-renders. */
function useValues(count: number) {
  return useRef(Array.from({ length: count }, () => new Animated.Value(0)))
    .current;
}

function Lanes({
  values,
  size = 32,
}: {
  values: Animated.Value[];
  size?: number;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const laneColors = [colors.primary, colors.pink, colors.green];
  return (
    <View style={styles.lanes}>
      {values.map((v, i) => (
        <Track key={i} height={size + 8}>
          <Box
            size={size}
            color={laneColors[i % laneColors.length]}
            label={String(i + 1)}
            style={{ transform: [{ translateX: v }] }}
          />
        </Track>
      ))}
    </View>
  );
}

const move = (value: Animated.Value, toValue: number, duration = 500) =>
  Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });

/** Animated.sequence: one after another. */
export function SequenceDemo() {
  const { t } = useTranslation('animated');
  const values = useValues(3);
  const travel = useTravel() + 12; // lanes use 32 px boxes

  const run = () =>
    play(
      'sequence',
      Animated.sequence([
        ...values.map(v => move(v, travel)),
        ...values.map(v => move(v, 0)).reverse(),
      ]),
    );

  return (
    <DemoCard
      title="Animated.sequence"
      api="Animated.sequence([a, b, c])"
      description={t('sequence.description')}
    >
      <Lanes values={values} />
      <Button label={t('sequence.play')} onPress={run} />
    </DemoCard>
  );
}

/** Animated.parallel: all at once. */
export function ParallelDemo() {
  const { t } = useTranslation('animated');
  const values = useValues(3);
  const travel = useTravel() + 12;
  const [stopTogether, setStopTogether] = useState<'true' | 'false'>('true');
  const running = useRef<Animated.CompositeAnimation | null>(null);

  const run = () => {
    values.forEach(v => v.setValue(0));
    running.current = Animated.parallel(
      values.map((v, i) => move(v, travel, 1200 + i * 900)),
      { stopTogether: stopTogether === 'true' },
    );
    play('parallel', running.current);
  };

  return (
    <DemoCard
      title="Animated.parallel"
      api="Animated.parallel([a, b, c], { stopTogether })"
      description={t('parallel.description')}
    >
      <Lanes values={values} />
      <Note>stopTogether</Note>
      <Chips
        options={['true', 'false'] as const}
        value={stopTogether}
        onChange={setStopTogether}
      />
      <Row>
        <Button label={t('parallel.play')} onPress={run} />
        <Button
          label={t('parallel.stopLane')}
          variant="secondary"
          onPress={() => values[0].stopAnimation()}
        />
      </Row>
    </DemoCard>
  );
}

const BAR_COUNT = 6;

/** Animated.stagger: parallel, but each one starts a bit later. */
export function StaggerDemo() {
  const { t } = useTranslation('animated');
  const styles = useStyles();
  const values = useValues(BAR_COUNT);
  const [up, setUp] = useState(false);

  const run = () => {
    setUp(!up);
    play(
      'stagger',
      Animated.stagger(
        120,
        values.map(v =>
          Animated.spring(v, {
            toValue: up ? 0 : 1,
            friction: 5,
            useNativeDriver: true,
          }),
        ),
      ),
    );
  };

  return (
    <DemoCard
      title="Animated.stagger"
      api="Animated.stagger(120, [a, b, c, ...])"
      description={t('stagger.description')}
    >
      <View style={styles.bars}>
        {values.map((v, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                opacity: v.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    translateY: v.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -60],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
      <Button label={up ? t('stagger.down') : t('stagger.up')} onPress={run} />
    </DemoCard>
  );
}

/** Animated.delay: a pause inside a sequence. */
export function DelayDemo() {
  const { t } = useTranslation('animated');
  const { colors } = useTheme();
  const value = useAnimatedValue(0);
  const travel = useTravel();

  const run = () =>
    play(
      'delay',
      Animated.sequence([
        move(value, travel),
        Animated.delay(1000),
        move(value, 0),
      ]),
    );

  return (
    <DemoCard
      title="Animated.delay"
      api="Animated.sequence([go, Animated.delay(1000), back])"
      description={t('delay.description')}
    >
      <Track>
        <Box
          color={colors.amber}
          style={{ transform: [{ translateX: value }] }}
        />
      </Track>
      <Button label={t('delay.run')} onPress={run} />
    </DemoCard>
  );
}

const ITERATIONS = ['infinite', '1', '3'] as const;
type Iterations = (typeof ITERATIONS)[number];

/** Animated.loop: repeats an animation. */
export function LoopDemo() {
  const { t } = useTranslation('animated');
  const styles = useStyles();
  const { colors } = useTheme();
  const value = useAnimatedValue(0);
  const [iterations, setIterations] = useState<Iterations>('infinite');
  const loop = useRef<Animated.CompositeAnimation | null>(null);

  // Stop the loop when leaving the screen.
  useEffect(() => () => loop.current?.stop(), []);

  const start = () => {
    loop.current?.stop();
    loop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      { iterations: iterations === 'infinite' ? -1 : Number(iterations) },
    );
    play(`loop (${iterations})`, loop.current);
  };

  const scale = value.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  // Chips show the translated label; the state keeps the id.
  const iterationLabel = (i: Iterations) =>
    i === 'infinite' ? t('loop.infinite') : i;
  const iterationOptions = ITERATIONS.map(iterationLabel);

  return (
    <DemoCard
      title="Animated.loop"
      api="Animated.loop(animation, { iterations: -1 })"
      description={t('loop.description')}
    >
      <View style={styles.center}>
        <Box color={colors.pink} label="♥" style={{ transform: [{ scale }] }} />
      </View>
      <Note>iterations</Note>
      <Chips
        options={iterationOptions}
        value={iterationLabel(iterations)}
        onChange={label =>
          setIterations(
            ITERATIONS.find(i => iterationLabel(i) === label) ?? 'infinite',
          )
        }
      />
      <Row>
        <Button label={t('loop.start')} onPress={start} />
        <Button
          label={t('loop.stop')}
          variant="secondary"
          onPress={() => loop.current?.stop()}
        />
      </Row>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  lanes: {
    gap: 6,
  },
  bars: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  bar: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: c.primary,
  },
  center: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
