import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withClamp,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { makeStyles, useTheme } from '../../../theme';
import {
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

/** withSequence: one animation after another, on the same value. */
export function SequenceDemo() {
  const { t } = useTranslation('reanimated');
  const x = useSharedValue(0);
  const travel = useTravel();
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <DemoCard
      title={t('sequence.title')}
      api="x.value = withSequence(withTiming(W), withSpring(W/2), withTiming(0))"
      description={t('sequence.description')}
    >
      <Track>
        <RBox style={style} />
      </Track>
      <Button
        label={t('sequence.play')}
        onPress={() => {
          logDemo('withSequence');
          x.value = withSequence(
            withTiming(travel, { duration: 500 }),
            withSpring(travel / 2, { stiffness: 150, damping: 6 }),
            withTiming(0, { duration: 500 }, logEnd('withSequence')),
          );
        }}
      />
    </DemoCard>
  );
}

/** withRepeat: repeat N times (or forever), optionally reversing. */
export function RepeatDemo() {
  const { t } = useTranslation('reanimated');
  const { colors } = useTheme();
  const styles = useStyles();
  const scale = useSharedValue(1);
  const [reps, setReps] = useState<'infinite' | '3'>('infinite');
  const [reverse, setReverse] = useState<'reverse' | 'restart'>('reverse');

  // Stop the loop when the screen closes.
  useEffect(() => () => cancelAnimation(scale), [scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <DemoCard
      title={t('repeat.title')}
      api="withRepeat(withTiming(1.5), -1, true) · cancelAnimation(sv)"
      description={t('repeat.description')}
    >
      <View style={styles.center}>
        <RBox color={colors.pink} label="♥" style={style} />
      </View>
      <Chips
        options={['infinite', '3'] as const}
        value={reps}
        onChange={setReps}
      />
      <Chips
        options={['reverse', 'restart'] as const}
        value={reverse}
        onChange={setReverse}
      />
      <Row>
        <Button
          label={t('common.start')}
          onPress={() => {
            logDemo('withRepeat', { reps, reverse });
            scale.value = 1;
            scale.value = withRepeat(
              withTiming(1.5, {
                duration: 450,
                easing: Easing.out(Easing.quad),
              }),
              reps === 'infinite' ? -1 : 3 * 2, // back and forth = 2 reps
              reverse === 'reverse',
              logEnd('withRepeat'),
            );
          }}
        />
        <Button
          label="cancelAnimation"
          variant="secondary"
          onPress={() => cancelAnimation(scale)}
        />
      </Row>
    </DemoCard>
  );
}

/** withDelay: start an animation later. */
export function DelayDemo() {
  const { t } = useTranslation('reanimated');
  const { colors } = useTheme();
  const values = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const travel = useTravel();
  const styles0 = useAnimatedStyle(() => ({
    transform: [{ translateX: values[0].value }],
  }));
  const styles1 = useAnimatedStyle(() => ({
    transform: [{ translateX: values[1].value }],
  }));
  const styles2 = useAnimatedStyle(() => ({
    transform: [{ translateX: values[2].value }],
  }));

  return (
    <DemoCard
      title={t('delay.title')}
      api="withDelay(300 * i, withSpring(W))"
      description={t('delay.description')}
    >
      <Track>
        <RBox size={32} style={styles0} />
      </Track>
      <Track>
        <RBox size={32} color={colors.pink} style={styles1} />
      </Track>
      <Track>
        <RBox size={32} color={colors.green} style={styles2} />
      </Track>
      <Button
        label={t('delay.stagger')}
        onPress={() => {
          logDemo('withDelay');
          values.forEach((v, i) => {
            v.value = withDelay(
              300 * i,
              withSpring(v.value > 0 ? 0 : travel + 12, {
                dampingRatio: 0.6,
                duration: 900,
              }),
            );
          });
        }}
      />
    </DemoCard>
  );
}

/** withClamp: limit a (bouncy) animation to a range. */
export function ClampDemo() {
  const { t } = useTranslation('reanimated');
  const { colors } = useTheme();
  const free = useSharedValue(0);
  const clamped = useSharedValue(0);
  const travel = useTravel();
  const limit = travel * 0.7;

  const freeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: free.value }],
  }));
  const clampedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: clamped.value }],
  }));

  return (
    <DemoCard
      title={t('clamp.title')}
      api="withClamp({ min: 0, max: 0.7 * W }, withSpring(0.7 * W))"
      description={t('clamp.description')}
    >
      <Track label="withSpring">
        <RBox color={colors.amber} style={freeStyle} />
      </Track>
      <Track label="withClamp(withSpring)">
        <RBox color={colors.green} style={clampedStyle} />
      </Track>
      <Button
        label={t('clamp.springBoth')}
        onPress={() => {
          const to = free.value > 0 ? 0 : limit;
          const spring = { stiffness: 140, damping: 4 };
          free.value = withSpring(to, spring);
          clamped.value = withClamp(
            { min: 0, max: limit },
            withSpring(to, spring),
          );
        }}
      />
    </DemoCard>
  );
}

/** ReduceMotion + useReducedMotion: respect the accessibility setting. */
export function ReduceMotionDemo() {
  const { t } = useTranslation('reanimated');
  const { colors } = useTheme();
  const styles = useStyles();
  const x = useSharedValue(0);
  const travel = useTravel();
  const systemReduced = useReducedMotion();
  const [mode, setMode] = useState<'System' | 'Always' | 'Never'>('System');

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <DemoCard
      title={t('reduceMotion.title')}
      api="withTiming(W, { reduceMotion: ReduceMotion.System })"
      description={t('reduceMotion.description')}
    >
      <Text style={styles.status}>
        {t('reduceMotion.status', {
          value: systemReduced ? t('reduceMotion.reduced') : 'false',
        })}
      </Text>
      <Track>
        <RBox color={colors.sky} style={style} />
      </Track>
      <SharedValueLabel value={x} label="x" digits={0} />
      <Chips
        options={['System', 'Always', 'Never'] as const}
        value={mode}
        onChange={setMode}
      />
      <Button
        label={t('common.animate')}
        onPress={() => {
          x.value = withTiming(x.value > 0 ? 0 : travel, {
            duration: 900,
            reduceMotion: ReduceMotion[mode],
          });
        }}
      />
      <Note>{t('reduceMotion.note')}</Note>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  center: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: c.text,
  },
}));
