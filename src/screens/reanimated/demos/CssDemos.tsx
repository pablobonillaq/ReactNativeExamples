import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, {
  css,
  cubicBezier,
  steps,
  type CSSAnimationKeyframes,
} from 'react-native-reanimated';
import { makeStyles, useTheme } from '../../../theme';
import {
  BOX,
  Button,
  Chips,
  DemoCard,
  Note,
  Row,
  Track,
  useTravel,
} from '../ui';

const TIMINGS = {
  'ease-in-out': 'ease-in-out',
  linear: 'linear',
  'steps(4)': steps(4),
  'cubicBezier(…)': cubicBezier(0.68, -0.55, 0.27, 1.55),
} as const;
type TimingName = keyof typeof TIMINGS;
const TIMING_NAMES = Object.keys(TIMINGS) as TimingName[];

/** Which props animate when they change, and how long it takes. */
const TRANSITION: {
  transitionProperty: ('width' | 'backgroundColor' | 'borderRadius')[];
  transitionDuration: number;
} = {
  transitionProperty: ['width', 'backgroundColor', 'borderRadius'],
  transitionDuration: 600,
};

/**
 * Reanimated 4 only: CSS-like transitions. Change a style prop and the
 * listed properties animate to the new value, no shared values involved.
 */
export function CssTransitionDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const { colors } = useTheme();
  const travel = useTravel();
  const [on, setOn] = useState(false);
  const [timing, setTiming] = useState<TimingName>('ease-in-out');
  const width = on ? travel + BOX : BOX;
  const backgroundColor = on ? colors.pink : colors.primary;
  const borderRadius = on ? BOX / 2 : 8;
  const transitionTimingFunction = TIMINGS[timing];

  return (
    <DemoCard
      title={t('cssTransition.title')}
      api="style={{ width, backgroundColor, transitionProperty: ['width', 'backgroundColor'], transitionDuration: 600 }}"
      description={t('cssTransition.description')}
    >
      <Track>
        <Animated.View
          style={[
            styles.box,
            TRANSITION,
            { width, backgroundColor, borderRadius, transitionTimingFunction },
          ]}
        />
      </Track>
      <Chips options={TIMING_NAMES} value={timing} onChange={setTiming} />
      <Button label={t('cssTransition.toggle')} onPress={() => setOn(!on)} />
    </DemoCard>
  );
}

const pulse: CSSAnimationKeyframes = {
  from: { transform: [{ scale: 1 }, { rotate: '0deg' }] },
  '50%': { transform: [{ scale: 1.4 }, { rotate: '180deg' }] },
  to: { transform: [{ scale: 1 }, { rotate: '360deg' }] },
};

// css.keyframes() makes a reusable rule (created once, shared by views).
const slide = css.keyframes({
  from: { transform: [{ translateX: 0 }] },
  to: { transform: [{ translateX: 220 }] },
});

const PULSE = {
  animationName: pulse,
  animationDuration: '1.2s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'ease-in-out',
} as const;

const SLIDE = {
  animationName: slide,
  animationDuration: 1000,
  animationIterationCount: 'infinite',
} as const;

/** Reanimated 4 only: CSS @keyframes animations. */
export function CssAnimationDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const [playing, setPlaying] = useState(true);
  const [direction, setDirection] = useState<
    'normal' | 'reverse' | 'alternate'
  >('alternate');
  const animationPlayState = playing ? 'running' : 'paused';

  return (
    <DemoCard
      title={t('cssAnimation.title')}
      api="style={{ animationName: keyframes, animationDuration: '1s', animationIterationCount: 'infinite' }}"
      description={t('cssAnimation.description')}
    >
      <View style={styles.center}>
        <Animated.View style={[styles.box, PULSE, { animationPlayState }]} />
      </View>
      <Track>
        <Animated.View
          style={[
            styles.box,
            styles.green,
            SLIDE,
            { animationDirection: direction, animationPlayState },
          ]}
        />
      </Track>
      <Chips
        options={['normal', 'reverse', 'alternate'] as const}
        value={direction}
        onChange={setDirection}
      />
      <Row>
        <Button
          label={playing ? t('common.pause') : t('common.play')}
          onPress={() => setPlaying(!playing)}
        />
      </Row>
      <Note>{t('cssAnimation.note')}</Note>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  box: {
    width: BOX,
    height: BOX,
    borderRadius: 8,
    backgroundColor: c.primary,
  },
  green: {
    backgroundColor: c.green,
  },
  center: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
