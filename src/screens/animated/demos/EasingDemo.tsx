import { useMemo, useState } from 'react';
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
  Track,
  useTravel,
} from '../ui';

type EasingFunction = (value: number) => number;

/** Base curves. The ones marked `fixed` ignore in / out / inOut. */
const CURVES: Record<
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
  bezier: {
    fn: Easing.bezier(0.68, -0.55, 0.27, 1.55),
    code: 'Easing.bezier(0.68, -0.55, 0.27, 1.55)',
    fixed: true,
  },
  step0: { fn: Easing.step0, code: 'Easing.step0', fixed: true },
  step1: { fn: Easing.step1, code: 'Easing.step1', fixed: true },
};
const CURVE_NAMES = Object.keys(CURVES);

const MODES = ['in', 'out', 'inOut'] as const;
type Mode = (typeof MODES)[number];

function withMode(name: string, mode: Mode) {
  const curve = CURVES[name];
  if (curve.fixed) {
    return { fn: curve.fn, code: curve.code };
  }
  return { fn: Easing[mode](curve.fn), code: `Easing.${mode}(${curve.code})` };
}

const PLOT = 120;
const POINTS = 40;

/** Draws y = easing(x) for x in [0, 1] with small dots. */
function Curve({ easing }: { easing: EasingFunction }) {
  const dots = useMemo(
    () =>
      Array.from({ length: POINTS + 1 }, (_, i) => {
        const x = i / POINTS;
        return { x, y: easing(x) };
      }),
    [easing],
  );
  const styles = useStyles();
  return (
    <View style={styles.plot}>
      <View style={styles.diagonal} />
      {dots.map(({ x, y }) => (
        <View
          key={x}
          style={[
            styles.dot,
            // y can go below 0 or above 1 (back, elastic, bezier).
            { left: x * PLOT - 2, bottom: y * PLOT - 2 },
          ]}
        />
      ))}
    </View>
  );
}

/** Easing: every curve React Native ships, with in / out / inOut. */
export function EasingDemo() {
  const { t } = useTranslation('animated');
  const { colors } = useTheme();
  const value = useAnimatedValue(0);
  const travel = useTravel();
  const [name, setName] = useState('bounce');
  const [mode, setMode] = useState<Mode>('out');
  const easing = withMode(name, mode);

  const run = () => {
    value.setValue(0);
    play(
      `Easing ${easing.code}`,
      Animated.timing(value, {
        toValue: 1,
        duration: 1200,
        easing: easing.fn,
        useNativeDriver: true,
      }),
    );
  };

  const translateX = value.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travel],
  });

  return (
    <DemoCard
      title="Easing"
      api={easing.code}
      description={t('easing.description')}
    >
      <Curve easing={easing.fn} />
      <Track>
        <Box color={colors.sky} style={{ transform: [{ translateX }] }} />
      </Track>
      <Chips options={CURVE_NAMES} value={name} onChange={setName} />
      {CURVES[name].fixed ? (
        <Note>{t('easing.fixed')}</Note>
      ) : (
        <Chips options={MODES} value={mode} onChange={setMode} />
      )}
      <Button label={t('easing.play')} onPress={run} />
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  plot: {
    width: PLOT,
    height: PLOT,
    alignSelf: 'center',
    marginVertical: 16,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: c.borderStrong,
  },
  diagonal: {
    position: 'absolute',
    width: PLOT * Math.SQRT2,
    height: 1,
    left: (PLOT - PLOT * Math.SQRT2) / 2,
    bottom: PLOT / 2,
    backgroundColor: c.border,
    transform: [{ rotate: '-45deg' }],
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.sky,
  },
}));
