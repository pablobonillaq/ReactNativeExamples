import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  clamp,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { makeStyles, useTheme, type ThemeColors } from '../../../theme';
import {
  BOX,
  Button,
  DemoCard,
  Note,
  RBox,
  SharedValueLabel,
  Track,
  useCardWidth,
  useTravel,
} from '../ui';

/** interpolate(): one value drives position, rotation, scale and opacity. */
export function InterpolateDemo() {
  const { t } = useTranslation('reanimated');
  const progress = useSharedValue(0);
  const travel = useTravel();

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [1, 0.4, 1]),
    borderRadius: interpolate(progress.value, [0, 1], [4, BOX / 2]),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, travel]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, 360])}deg` },
      { scale: interpolate(progress.value, [0, 0.5, 1], [1, 1.6, 1]) },
    ],
  }));

  return (
    <DemoCard
      title={t('interpolate.title')}
      api="interpolate(sv.value, [0, 0.5, 1], [1, 1.6, 1], Extrapolation.CLAMP)"
      description={t('interpolate.description')}
    >
      <Track height={BOX + 40}>
        <RBox style={style} />
      </Track>
      <SharedValueLabel value={progress} label="progress" />
      <Button
        label={t('common.animate')}
        onPress={() => {
          progress.value = withTiming(progress.value > 0.5 ? 0 : 1, {
            duration: 1500,
            easing: Easing.inOut(Easing.cubic),
          });
        }}
      />
    </DemoCard>
  );
}

/** Lane colors are theme tokens, resolved in ExtrapolationLane. */
const EXTRAPOLATIONS: {
  label: string;
  type: Extrapolation;
  color: keyof ThemeColors;
}[] = [
  {
    label: 'Extrapolation.EXTEND',
    type: Extrapolation.EXTEND,
    color: 'primary',
  },
  {
    label: 'Extrapolation.CLAMP',
    type: Extrapolation.CLAMP,
    color: 'green',
  },
  {
    label: 'Extrapolation.IDENTITY',
    type: Extrapolation.IDENTITY,
    color: 'amber',
  },
];

function ExtrapolationLane({
  value,
  half,
  label,
  type,
  color,
}: {
  value: SharedValue<number>;
  half: number;
  label: string;
  type: Extrapolation;
  color: keyof ThemeColors;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(value.value, [0, 1], [0, half], type) },
    ],
  }));
  return (
    <Track label={label}>
      <View style={[styles.limit, { left: half + BOX }]} />
      <RBox color={colors[color]} style={style} />
    </Track>
  );
}

/** What happens outside inputRange. */
export function ExtrapolationDemo() {
  const { t } = useTranslation('reanimated');
  const value = useSharedValue(0);
  const half = useTravel() / 2;

  return (
    <DemoCard
      title={t('extrapolation.title')}
      api="interpolate(v, [0, 1], [0, W/2], Extrapolation.CLAMP)"
      description={t('extrapolation.description')}
    >
      {EXTRAPOLATIONS.map(e => (
        <ExtrapolationLane key={e.label} value={value} half={half} {...e} />
      ))}
      <SharedValueLabel value={value} />
      <Button
        label={t('extrapolation.animate')}
        onPress={() => {
          value.value = 0;
          value.value = withTiming(2, {
            duration: 2000,
            easing: Easing.linear,
          });
        }}
      />
      <Note>{t('extrapolation.note')}</Note>
    </DemoCard>
  );
}

const COLOR_SPACES = ['RGB', 'HSV', 'LAB'] as const;

// Content colors: the demo blends this exact red into this exact blue (the
// same in both themes, and shown in the card's api text).
const BLEND_FROM = '#ef4444';
const BLEND_TO = '#3b82f6';

function ColorStrip({
  progress,
  space,
}: {
  progress: SharedValue<number>;
  space: (typeof COLOR_SPACES)[number];
}) {
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [BLEND_FROM, BLEND_TO],
      space,
    ),
  }));
  const styles = useStyles();
  return (
    <Track label={`interpolateColor(…, '${space}')`}>
      <Animated.View style={[styles.strip, style]} />
    </Track>
  );
}

/** interpolateColor in RGB, HSV and LAB. */
export function InterpolateColorDemo() {
  const { t } = useTranslation('reanimated');
  const progress = useSharedValue(0);

  return (
    <DemoCard
      title={t('interpolateColor.title')}
      api="interpolateColor(v, [0, 1], ['#ef4444', '#3b82f6'], 'HSV')"
      description={t('interpolateColor.description')}
    >
      {COLOR_SPACES.map(space => (
        <ColorStrip key={space} progress={progress} space={space} />
      ))}
      <Button
        label={t('interpolateColor.blend')}
        onPress={() => {
          progress.value = withTiming(progress.value > 0.5 ? 0 : 1, {
            duration: 2000,
          });
        }}
      />
    </DemoCard>
  );
}

/** clamp(): keep a number inside [min, max] in a worklet. */
export function ClampFunctionDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const { colors } = useTheme();
  const x = useSharedValue(0);
  const width = useCardWidth();
  const min = width * 0.25;
  const max = width * 0.6;

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: clamp(x.value, min, max) }],
  }));

  return (
    <DemoCard
      title={t('clampFunction.title')}
      api="clamp(x.value, min, max)"
      description={t('clampFunction.description')}
    >
      <Track>
        <View style={[styles.limit, { left: min }]} />
        <View style={[styles.limit, { left: max + BOX }]} />
        <RBox color={colors.pink} style={style} />
      </Track>
      <Button
        label={t('clampFunction.run')}
        onPress={() => {
          x.value = 0;
          x.value = withTiming(width, {
            duration: 1500,
            easing: Easing.linear,
          });
        }}
      />
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  limit: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderColor: c.textMuted,
  },
  strip: {
    ...StyleSheet.absoluteFill,
  },
}));
