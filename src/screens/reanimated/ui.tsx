import { useState, type ComponentProps } from 'react';
import { Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  type SharedValue,
} from 'react-native-reanimated';
import { createLogger } from '../../observability/logger';
import { makeStyles, useTheme } from '../../theme';
import { BOX } from '../animated/ui';

/**
 * Building blocks for the Reanimated demos. Layout pieces (cards, buttons,
 * chips…) are shared with the Animated API screen.
 */
export {
  BOX,
  Button,
  Chips,
  DemoCard,
  Note,
  Row,
  ScrollLockContext,
  Section,
  Track,
  useCardWidth,
  useSetScrollEnabled,
  useTravel,
} from '../animated/ui';

const log = createLogger('Reanimated');

/** Logs a demo action from the JS thread. */
export function logDemo(demo: string, data?: Record<string, unknown>) {
  log.debug(demo, data);
}

/**
 * Animation callback for withTiming / withSpring / …: runs on the UI thread,
 * so it hops back to JS with runOnJS to log.
 */
export function logEnd(demo: string) {
  return (finished?: boolean) => {
    'worklet';
    runOnJS(logDemo)(`${demo} ended`, { finished });
  };
}

type AnimatedViewStyle = ComponentProps<typeof Animated.View>['style'];

/** A colored square rendered by Reanimated. */
export function RBox({
  color,
  label,
  size = BOX,
  style,
}: {
  /** Defaults to the theme's primary color. */
  color?: string;
  label?: string;
  size?: number;
  style?: AnimatedViewStyle;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Animated.View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          backgroundColor: color ?? colors.primary,
        },
        style,
      ]}
    >
      {label ? <Text style={styles.boxLabel}>{label}</Text> : null}
    </Animated.View>
  );
}

/**
 * Shows a shared value as text. useAnimatedReaction watches it on the UI
 * thread and runOnJS sends the new number to React state.
 */
export function SharedValueLabel({
  value,
  label = 'value',
  digits = 2,
}: {
  value: SharedValue<number>;
  label?: string;
  digits?: number;
}) {
  const styles = useStyles();
  const [current, setCurrent] = useState(0);
  useAnimatedReaction(
    () => value.value,
    (next, previous) => {
      if (next !== previous) {
        runOnJS(setCurrent)(next);
      }
    },
  );
  return (
    <Text style={styles.value}>
      {label} = {current.toFixed(digits)}
    </Text>
  );
}

const useStyles = makeStyles(c => ({
  box: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxLabel: {
    color: c.textOnPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: c.text,
  },
}));
