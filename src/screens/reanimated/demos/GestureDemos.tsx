import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import {
  GestureDetector,
  useExclusiveGestures,
  useLongPressGesture,
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { makeStyles, useTheme } from '../../../theme';
import {
  Button,
  DemoCard,
  logDemo,
  Note,
  Track,
  useCardWidth,
  useSetScrollEnabled,
} from '../ui';

const AREA = 220;
const BALL = 56;

/**
 * Pan with react-native-gesture-handler 3 (usePanGesture) driving shared
 * values on the UI thread; on release, withDecay keeps the finger's velocity.
 */
export function PanDecayDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  // Plain strings captured by the animated style worklet.
  const { pink, primary } = useTheme().colors;
  const setScrollEnabled = useSetScrollEnabled();
  const width = useCardWidth();
  const maxX = width - BALL;
  const maxY = AREA - BALL;
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const pressed = useSharedValue(false);

  const pan = usePanGesture({
    onBegin: () => {
      'worklet';
      pressed.value = true;
      // The page's ScrollView would steal the gesture otherwise.
      runOnJS(setScrollEnabled)(false);
    },
    onActivate: () => {
      'worklet';
      startX.value = x.value;
      startY.value = y.value;
    },
    onUpdate: event => {
      'worklet';
      x.value = startX.value + event.translationX;
      y.value = startY.value + event.translationY;
    },
    onDeactivate: event => {
      'worklet';
      // Keep moving with the release velocity, bouncing at the edges.
      x.value = withDecay({
        velocity: event.velocityX,
        clamp: [0, maxX],
        rubberBandEffect: true,
      });
      y.value = withDecay({
        velocity: event.velocityY,
        clamp: [0, maxY],
        rubberBandEffect: true,
      });
    },
    onFinalize: () => {
      'worklet';
      pressed.value = false;
      runOnJS(setScrollEnabled)(true);
    },
  });

  const style = useAnimatedStyle(() => ({
    backgroundColor: pressed.value ? pink : primary,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: withSpring(pressed.value ? 1.15 : 1) },
    ],
  }));

  return (
    <DemoCard
      title={t('panDecay.title')}
      api="usePanGesture({ onUpdate, onDeactivate: e => withDecay({ velocity: e.velocityX }) })"
      description={t('panDecay.description')}
    >
      <Track height={AREA} style={styles.area}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.ball, style]} />
        </GestureDetector>
      </Track>
      <Note>{t('panDecay.note')}</Note>
    </DemoCard>
  );
}

type TapResult = 'initial' | 'singleTap' | 'doubleTap' | 'longPress';

/** Tap, double tap and long press, with useExclusiveGestures. */
export function TapDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const { colors } = useTheme();
  // Plain strings captured by the animated style worklet.
  const palette = [colors.primary, colors.green, colors.amber];
  // Id of the last gesture; its text comes from tap.results.<id>.
  const [last, setLast] = useState<TapResult>('initial');
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const hue = useSharedValue(0);

  const report = (result: TapResult) => {
    setLast(result);
    logDemo('gesture', { result });
  };

  const singleTap = useTapGesture({
    onActivate: () => {
      'worklet';
      scale.value = withSequence(
        withTiming(0.8, { duration: 80 }),
        withSpring(1),
      );
      runOnJS(report)('singleTap');
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: () => {
      'worklet';
      rotation.value = withSpring(rotation.value + 360);
      runOnJS(report)('doubleTap');
    },
  });

  const longPress = useLongPressGesture({
    minDuration: 500,
    onActivate: () => {
      'worklet';
      hue.value = withTiming((hue.value + 1) % 3, { duration: 300 });
      runOnJS(report)('longPress');
    },
  });

  // Earlier gestures win: a single tap only fires after the long press and
  // the double tap have failed.
  const gesture = useExclusiveGestures(longPress, doubleTap, singleTap);

  const style = useAnimatedStyle(() => {
    return {
      backgroundColor: palette[Math.round(hue.value) % 3],
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <DemoCard
      title={t('tap.title')}
      api="useExclusiveGestures(longPress, doubleTap, singleTap)"
      description={t('tap.description')}
    >
      <View style={styles.center}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.square, style]} />
        </GestureDetector>
      </View>
      <Text style={styles.last}>{t(`tap.results.${last}`)}</Text>
    </DemoCard>
  );
}

/** Pinch + rotate + pan at the same time. */
export function PinchRotateDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const setScrollEnabled = useSetScrollEnabled();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const lockScroll = () => {
    'worklet';
    runOnJS(setScrollEnabled)(false);
  };
  const unlockScroll = () => {
    'worklet';
    runOnJS(setScrollEnabled)(true);
  };

  const pinch = usePinchGesture({
    onBegin: lockScroll,
    onUpdate: event => {
      'worklet';
      scale.value = savedScale.value * event.scale;
    },
    onDeactivate: () => {
      'worklet';
      savedScale.value = scale.value;
    },
    onFinalize: unlockScroll,
  });

  const rotate = useRotationGesture({
    onBegin: lockScroll,
    onUpdate: event => {
      'worklet';
      rotation.value = savedRotation.value + event.rotation;
    },
    onDeactivate: () => {
      'worklet';
      savedRotation.value = rotation.value;
    },
    onFinalize: unlockScroll,
  });

  const pan = usePanGesture({
    onBegin: lockScroll,
    onUpdate: event => {
      'worklet';
      x.value = savedX.value + event.translationX;
      y.value = savedY.value + event.translationY;
    },
    onDeactivate: () => {
      'worklet';
      savedX.value = x.value;
      savedY.value = y.value;
    },
    onFinalize: unlockScroll,
  });

  const gesture = useSimultaneousGestures(pinch, rotate, pan);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const reset = () => {
    scale.value = withSpring(1);
    rotation.value = withSpring(0);
    x.value = withSpring(0);
    y.value = withSpring(0);
    savedScale.value = 1;
    savedRotation.value = 0;
    savedX.value = 0;
    savedY.value = 0;
  };

  return (
    <DemoCard
      title={t('pinchRotate.title')}
      api="useSimultaneousGestures(usePinchGesture(), useRotationGesture(), usePanGesture())"
      description={t('pinchRotate.description')}
    >
      <Track height={AREA} style={styles.centerArea}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.photo, style]}>
            <Text style={styles.photoText}>🖼️</Text>
          </Animated.View>
        </GestureDetector>
      </Track>
      <Button label={t('common.reset')} variant="secondary" onPress={reset} />
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  area: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  ball: {
    width: BALL,
    height: BALL,
    borderRadius: BALL / 2,
  },
  center: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  square: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  last: {
    textAlign: 'center',
    color: c.textMuted,
  },
  centerArea: {
    alignItems: 'center',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: c.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: 48,
  },
}));
