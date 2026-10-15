import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { makeStyles } from '../theme';

type Props = {
  /** Every time this value changes (and is not 0) the highlight blinks. */
  trigger: number;
  children: ReactNode;
};

const BLINKS = 3;
const HALF_BLINK_MS = 250;

/** Wraps content with a background that blinks to draw attention to it. */
export function BlinkHighlight({ trigger, children }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const styles = useStyles();

  useEffect(() => {
    if (!trigger) {
      return;
    }
    const blink = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: HALF_BLINK_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: HALF_BLINK_MS,
        useNativeDriver: true,
      }),
    ]);
    const animation = Animated.loop(blink, { iterations: BLINKS });
    animation.start();
    return () => animation.stop();
  }, [trigger, opacity]);

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[styles.highlight, { opacity }]}
      />
      {children}
    </View>
  );
}

const useStyles = makeStyles(c => ({
  container: {
    width: '100%',
  },
  highlight: {
    ...StyleSheet.absoluteFill,
    // Extends a bit beyond the field so the glow surrounds it.
    top: -8,
    bottom: -8,
    left: -8,
    right: -8,
    borderRadius: 14,
    backgroundColor: c.highlight,
  },
}));
