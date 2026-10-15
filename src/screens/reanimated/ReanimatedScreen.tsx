import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  reanimatedVersion,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createLogger } from '../../observability/logger';
import { makeStyles } from '../../theme';
import {
  AnimatableValuesDemo,
  DecayDemo,
  SpringDemo,
  TimingDemo,
} from './demos/AnimationFunctionDemos';
import { CssAnimationDemo, CssTransitionDemo } from './demos/CssDemos';
import { KeyboardDemo, SensorDemo } from './demos/DeviceDemos';
import { PanDecayDemo, PinchRotateDemo, TapDemo } from './demos/GestureDemos';
import {
  ClampFunctionDemo,
  ExtrapolationDemo,
  InterpolateColorDemo,
  InterpolateDemo,
} from './demos/InterpolationDemos';
import {
  EnteringExitingDemo,
  KeyframeDemo,
  LayoutAnimationConfigDemo,
  LayoutTransitionDemo,
} from './demos/LayoutAnimationDemos';
import {
  ClampDemo,
  DelayDemo,
  ReduceMotionDemo,
  RepeatDemo,
  SequenceDemo,
} from './demos/ModifierDemos';
import { ScrollHandlerDemo, ScrollToMeasureDemo } from './demos/ScrollDemos';
import {
  AnimatedPropsDemo,
  AnimatedReactionDemo,
  DerivedValueDemo,
  SharedValueDemo,
} from './demos/SharedValueDemos';
import {
  FrameCallbackDemo,
  ThreadHopDemo,
  UIThreadDemo,
} from './demos/ThreadDemos';
import { ScrollLockContext, Section } from './ui';

const log = createLogger('Reanimated');

/**
 * Everything shown on this screen, grouped like the sections. Texts live in
 * the 'reanimated' namespace under reference.rows.<id>.
 */
const API_REFERENCE = [
  'sharedValue',
  'animatedStyle',
  'derivedValue',
  'animatedReaction',
  'animatedProps',
  'timing',
  'spring',
  'decay',
  'animatable',
  'modifiers',
  'cancel',
  'reduceMotion',
  'interpolate',
  'interpolateColor',
  'gestures',
  'pinchRotate',
  'combineGestures',
  'scrollHandler',
  'scrollRefs',
  'entering',
  'layoutTransitions',
  'keyframe',
  'frameCallback',
  'runOn',
  'uiThread',
  'sensor',
  'keyboard',
  'css',
  'notShown',
] as const;

/**
 * Reanimated playground: the Reanimated 3 API (all of it still works in
 * Reanimated 4, the version installed) plus the CSS features Reanimated 4
 * added. Gestures use react-native-gesture-handler 3.
 */
export function ReanimatedScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t } = useTranslation('reanimated');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollY = useSharedValue(0);
  const maxScroll = useSharedValue(1);

  useEffect(() => {
    log.info('Reanimated screen opened', { version: reanimatedVersion });
  }, []);

  // The screen's own scroll drives the progress bar, on the UI thread.
  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
    maxScroll.value = Math.max(
      1,
      event.contentSize.height - event.layoutMeasurement.height,
    );
  });

  const progressStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX: interpolate(
          scrollY.value,
          [0, maxScroll.value],
          [0, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <ScrollLockContext.Provider value={setScrollEnabled}>
      <View style={styles.container}>
        <Animated.View style={[styles.progress, progressStyle]} />
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          scrollEnabled={scrollEnabled}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          <Text style={styles.intro}>
            {t('screen.intro', { version: reanimatedVersion })}
          </Text>

          <Section
            title={t('screen.sections.sharedValues.title')}
            subtitle={t('screen.sections.sharedValues.subtitle')}
          >
            <SharedValueDemo />
            <DerivedValueDemo />
            <AnimatedReactionDemo />
            <AnimatedPropsDemo />
          </Section>

          <Section
            title={t('screen.sections.animations.title')}
            subtitle={t('screen.sections.animations.subtitle')}
          >
            <TimingDemo />
            <SpringDemo />
            <DecayDemo />
            <AnimatableValuesDemo />
          </Section>

          <Section
            title={t('screen.sections.modifiers.title')}
            subtitle={t('screen.sections.modifiers.subtitle')}
          >
            <SequenceDemo />
            <RepeatDemo />
            <DelayDemo />
            <ClampDemo />
            <ReduceMotionDemo />
          </Section>

          <Section
            title={t('screen.sections.interpolation.title')}
            subtitle={t('screen.sections.interpolation.subtitle')}
          >
            <InterpolateDemo />
            <ExtrapolationDemo />
            <InterpolateColorDemo />
            <ClampFunctionDemo />
          </Section>

          <Section
            title={t('screen.sections.gestures.title')}
            subtitle={t('screen.sections.gestures.subtitle')}
          >
            <PanDecayDemo />
            <TapDemo />
            <PinchRotateDemo />
          </Section>

          <Section
            title={t('screen.sections.scroll.title')}
            subtitle={t('screen.sections.scroll.subtitle')}
          >
            <ScrollHandlerDemo />
            <ScrollToMeasureDemo />
          </Section>

          <Section
            title={t('screen.sections.layout.title')}
            subtitle={t('screen.sections.layout.subtitle')}
          >
            <EnteringExitingDemo />
            <LayoutTransitionDemo />
            <KeyframeDemo />
            <LayoutAnimationConfigDemo />
          </Section>

          <Section
            title={t('screen.sections.threads.title')}
            subtitle={t('screen.sections.threads.subtitle')}
          >
            <FrameCallbackDemo />
            <ThreadHopDemo />
            <UIThreadDemo />
          </Section>

          <Section
            title={t('screen.sections.device.title')}
            subtitle={t('screen.sections.device.subtitle')}
          >
            <SensorDemo />
            <KeyboardDemo />
          </Section>

          <Section
            title={t('screen.sections.extras.title')}
            subtitle={t('screen.sections.extras.subtitle')}
          >
            <CssTransitionDemo />
            <CssAnimationDemo />
          </Section>

          <Section
            title={t('screen.sections.reference.title')}
            subtitle={t('screen.sections.reference.subtitle')}
          >
            <View style={styles.reference}>
              {API_REFERENCE.map(id => (
                <View key={id} style={styles.referenceRow}>
                  <Text style={styles.referenceApi}>
                    {t(`reference.rows.${id}.api`)}
                  </Text>
                  <Text style={styles.referenceWhere}>
                    {t(`reference.rows.${id}.where`)}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        </Animated.ScrollView>
      </View>
    </ScrollLockContext.Provider>
  );
}

const useStyles = makeStyles(c => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 1,
    backgroundColor: c.pink,
    transformOrigin: 'left',
  },
  content: {
    padding: 16,
  },
  intro: {
    fontSize: 14,
    color: c.textMuted,
    marginBottom: 8,
  },
  reference: {
    backgroundColor: c.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  referenceRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  referenceApi: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: c.text,
  },
  referenceWhere: {
    marginTop: 2,
    fontSize: 12,
    color: c.textMuted,
  },
}));
