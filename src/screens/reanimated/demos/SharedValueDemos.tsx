import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, type TextInputProps } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { makeStyles, useTheme } from '../../../theme';
import {
  Button,
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

/** useSharedValue + useAnimatedStyle: the core of Reanimated. */
export function SharedValueDemo() {
  const { t } = useTranslation('reanimated');
  const progress = useSharedValue(0);
  const travel = useTravel();

  // Runs on the UI thread every time progress changes.
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * travel }],
  }));

  return (
    <DemoCard
      title={t('sharedValue.title')}
      api="const sv = useSharedValue(0); sv.value = withTiming(1)"
      description={t('sharedValue.description')}
    >
      <Track>
        <RBox style={style} />
      </Track>
      <SharedValueLabel value={progress} label="progress" />
      <Row>
        <Button
          label="sv.value = 0"
          variant="secondary"
          onPress={() => {
            progress.value = 0;
          }}
        />
        <Button
          label="sv.set(1)"
          variant="secondary"
          onPress={() => progress.set(1)}
        />
        <Button
          label="sv.value = withTiming(…)"
          onPress={() => {
            logDemo('shared value timing');
            progress.value = withTiming(
              progress.value > 0.5 ? 0 : 1,
              { duration: 700 },
              logEnd('shared value timing'),
            );
          }}
        />
        <Button
          label="sv.modify(v => v / 2)"
          variant="secondary"
          onPress={() =>
            progress.modify(v => {
              'worklet';
              return v / 2;
            })
          }
        />
      </Row>
    </DemoCard>
  );
}

/** useDerivedValue: a read-only value computed from other shared values. */
export function DerivedValueDemo() {
  const { t } = useTranslation('reanimated');
  const { colors } = useTheme();
  const x = useSharedValue(0);
  const travel = useTravel();

  // Recomputed on the UI thread whenever x changes.
  const mirrored = useDerivedValue(() => travel - x.value);
  const half = useDerivedValue(() => x.value / 2);

  const xStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));
  const mirroredStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mirrored.value }],
  }));
  const halfStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: half.value }],
  }));

  return (
    <DemoCard
      title={t('derivedValue.title')}
      api="const mirrored = useDerivedValue(() => W - x.value)"
      description={t('derivedValue.description')}
    >
      <Track label="x">
        <RBox style={xStyle} />
      </Track>
      <Track label="W - x">
        <RBox color={colors.pink} style={mirroredStyle} />
      </Track>
      <Track label="x / 2">
        <RBox color={colors.green} style={halfStyle} />
      </Track>
      <Button
        label={t('derivedValue.animate')}
        onPress={() => {
          x.value = withSpring(x.value > 0 ? 0 : travel, {
            duration: 1200,
            dampingRatio: 0.6,
          });
        }}
      />
    </DemoCard>
  );
}

/** useAnimatedReaction + runOnJS: react to a value on the UI thread. */
export function AnimatedReactionDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  // Plain strings captured by the worklet below.
  const { green, primary } = useTheme().colors;
  const x = useSharedValue(0);
  const crossCount = useSharedValue(0);
  const travel = useTravel();
  const [crossings, setCrossings] = useState(0);

  // prepare() picks what to watch; react() runs when it changes.
  useAnimatedReaction(
    () => x.value > travel / 2,
    (pastHalf, wasPastHalf) => {
      if (wasPastHalf !== null && pastHalf !== wasPastHalf) {
        crossCount.value += 1;
        // React state lives on the JS thread: hop over with runOnJS.
        runOnJS(setCrossings)(crossCount.value);
      }
    },
    [travel],
  );

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    backgroundColor: x.value > travel / 2 ? green : primary,
  }));

  return (
    <DemoCard
      title={t('animatedReaction.title')}
      api="useAnimatedReaction(() => x.value > W/2, (now, before) => runOnJS(fn)(…))"
      description={t('animatedReaction.description')}
    >
      <Track>
        <RBox style={style} />
      </Track>
      <Text style={styles.text}>
        {t('animatedReaction.crossed', { count: crossings })}
      </Text>
      <Button
        label={t('animatedReaction.move')}
        onPress={() => {
          x.value = withTiming(x.value > 0 ? 0 : travel, { duration: 900 });
        }}
      />
      <Note>{t('animatedReaction.note')}</Note>
    </DemoCard>
  );
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/** useAnimatedProps: animate non-style props (here the text of an input). */
export function AnimatedPropsDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const count = useSharedValue(0);

  // `text` isn't a public TextInput prop, but the native view accepts it:
  // the number changes every frame without any React render.
  const animatedProps = useAnimatedProps(() => {
    const text = `${Math.round(count.value)}`;
    return { text, defaultValue: text } as TextInputProps;
  });

  return (
    <DemoCard
      title={t('animatedProps.title')}
      api="useAnimatedProps(() => ({ text: `${sv.value}` }))"
      description={t('animatedProps.description')}
    >
      <AnimatedTextInput
        editable={false}
        underlineColorAndroid="transparent"
        style={styles.counter}
        animatedProps={animatedProps}
      />
      <Row>
        <Button
          label={t('animatedProps.count')}
          onPress={() => {
            count.value = 0;
            count.value = withTiming(1000, { duration: 2000 });
          }}
        />
        <Button
          label={t('common.reset')}
          variant="secondary"
          onPress={() => {
            count.value = 0;
          }}
        />
      </Row>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  text: {
    color: c.text,
  },
  counter: {
    fontSize: 40,
    fontWeight: '800',
    color: c.primary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
}));
