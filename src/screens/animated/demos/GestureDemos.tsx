import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, PanResponder, View, useAnimatedValueXY } from 'react-native';
import { makeStyles } from '../../../theme';
import {
  Box,
  Button,
  DemoCard,
  Note,
  play,
  Track,
  useSetScrollEnabled,
} from '../ui';

const AREA = 200;

/**
 * Drag with PanResponder + Animated.event. setOffset / flattenOffset keep
 * the box where it was dropped, so the next drag continues from there.
 */
export function DragDemo() {
  const { t } = useTranslation('animated');
  const styles = useStyles();
  const setScrollEnabled = useSetScrollEnabled();
  const pan = useAnimatedValueXY({ x: 0, y: 0 });

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        setScrollEnabled(false);
        // Move the current position into the offset and start from 0:
        // value + offset = where the box is.
        pan.extractOffset();
      },
      // Maps gesture.dx / dy straight into pan.x / pan.y.
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        setScrollEnabled(true);
        // Merge the offset back into the value.
        pan.flattenOffset();
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
        pan.flattenOffset();
      },
    }),
  ).current;

  return (
    <DemoCard
      title={t('drag.title')}
      api="Animated.event([null, { dx: pan.x, dy: pan.y }]) · extractOffset · flattenOffset"
      description={t('drag.description')}
    >
      <Track height={AREA} style={styles.area}>
        <Animated.View
          {...responder.panHandlers}
          style={{ transform: pan.getTranslateTransform() }}
        >
          <Box label={t('drag.box')} />
        </Animated.View>
      </Track>
      <Button
        label={t('drag.reset')}
        variant="secondary"
        onPress={() =>
          play(
            'drag reset',
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }),
          )
        }
      />
    </DemoCard>
  );
}

/**
 * Throw: on release, Animated.decay continues with the finger's velocity,
 * then a spring brings the ball back to the center.
 */
export function ThrowDemo() {
  const { t } = useTranslation('animated');
  const styles = useStyles();
  const setScrollEnabled = useSetScrollEnabled();
  const pan = useAnimatedValueXY({ x: 0, y: 0 });

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        setScrollEnabled(false);
        pan.stopAnimation();
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_event, gesture) => {
        setScrollEnabled(true);
        pan.flattenOffset();
        play(
          'throw',
          Animated.sequence([
            Animated.decay(pan, {
              velocity: { x: gesture.vx, y: gesture.vy },
              deceleration: 0.99,
              useNativeDriver: false,
            }),
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 4,
              useNativeDriver: false,
            }),
          ]),
        );
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
        pan.flattenOffset();
      },
    }),
  ).current;

  return (
    <DemoCard
      title={t('throw.title')}
      api="Animated.decay(pan, { velocity: { x: vx, y: vy } }) → Animated.spring"
      description={t('throw.description')}
    >
      <Track height={AREA} style={styles.center}>
        <Animated.View
          {...responder.panHandlers}
          style={{ transform: pan.getTranslateTransform() }}
        >
          <View style={styles.ball} />
        </Animated.View>
      </Track>
      <Note>{t('throw.note')}</Note>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  area: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  center: {
    alignItems: 'center',
  },
  ball: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: c.pink,
  },
}));
