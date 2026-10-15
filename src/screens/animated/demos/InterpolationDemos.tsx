import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Text, View, useAnimatedValue } from 'react-native';
import { makeStyles, useTheme } from '../../../theme';
import {
  BOX,
  Box,
  Button,
  DemoCard,
  Note,
  play,
  Track,
  useTravel,
  ValueLabel,
} from '../ui';

/** One value (0 → 1) drives many properties through interpolate(). */
export function InterpolateDemo() {
  const { t } = useTranslation('animated');
  const styles = useStyles();
  const { colors } = useTheme();
  const progress = useAnimatedValue(0);
  const travel = useTravel();
  const [atEnd, setAtEnd] = useState(false);

  const run = () => {
    setAtEnd(!atEnd);
    play(
      'interpolate',
      Animated.timing(progress, {
        toValue: atEnd ? 0 : 1,
        duration: 1500,
        easing: Easing.inOut(Easing.cubic),
        // Colors and borderRadius aren't supported by the native driver on
        // every platform, so this demo runs on the JS thread.
        useNativeDriver: false,
      }),
    );
  };

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travel],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.5, 1], // several stops
    outputRange: [1, 1.6, 1],
  });
  const backgroundColor = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [colors.primary, colors.pink, colors.green],
  });
  const borderRadius = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [4, BOX / 2],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.4, 1],
  });

  return (
    <DemoCard
      title="value.interpolate()"
      api="v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [...] })"
      description={t('interpolate.description')}
    >
      <Track height={BOX + 40}>
        <Animated.View
          style={[
            styles.box,
            {
              backgroundColor,
              borderRadius,
              opacity,
              transform: [{ translateX }, { rotate }, { scale }],
            },
          ]}
        />
      </Track>
      <ValueLabel value={progress} label="progress" />
      <Button
        label={atEnd ? t('interpolate.toZero') : t('interpolate.toOne')}
        onPress={run}
      />
    </DemoCard>
  );
}

const MODES = ['extend', 'clamp', 'identity'] as const;

/** What happens outside inputRange: extend, clamp or identity. */
export function ExtrapolateDemo() {
  const { t } = useTranslation('animated');
  const styles = useStyles();
  const { colors } = useTheme();
  const modeColors = {
    extend: colors.primary,
    clamp: colors.green,
    identity: colors.amber,
  };
  const value = useAnimatedValue(0);
  const half = useTravel() / 2;

  const run = () => {
    value.setValue(0);
    play(
      'extrapolate',
      Animated.sequence([
        Animated.timing(value, {
          toValue: 2, // goes beyond the inputRange [0, 1]
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
  };

  return (
    <DemoCard
      title="extrapolate"
      api="v.interpolate({ inputRange: [0, 1], outputRange: [0, W/2], extrapolate })"
      description={t('extrapolate.description')}
    >
      {MODES.map(mode => (
        <Track key={mode} label={`extrapolate: '${mode}'`}>
          <View style={[styles.limit, { left: half + BOX }]} />
          <Box
            color={modeColors[mode]}
            style={{
              transform: [
                {
                  translateX: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, half],
                    extrapolate: mode,
                  }),
                },
              ],
            }}
          />
        </Track>
      ))}
      <ValueLabel value={value} />
      <Note>{t('extrapolate.note')}</Note>
      <Text style={styles.hint}>{t('extrapolate.hint')}</Text>
      <Button label={t('extrapolate.run')} onPress={run} />
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  box: {
    width: BOX,
    height: BOX,
  },
  limit: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderColor: c.textMuted,
  },
  hint: {
    fontSize: 12,
    color: c.textMuted,
  },
}));
