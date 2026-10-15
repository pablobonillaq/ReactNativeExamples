import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useAnimatedValue,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createLogger } from '../../observability/logger';
import { makeStyles } from '../../theme';
import { DecayDemo, SpringDemo, TimingDemo } from './demos/AnimationTypeDemos';
import {
  AnimatedTextDemo,
  CreateAnimatedComponentDemo,
} from './demos/ComponentDemos';
import {
  DelayDemo,
  LoopDemo,
  ParallelDemo,
  SequenceDemo,
  StaggerDemo,
} from './demos/CompositionDemos';
import { EasingDemo } from './demos/EasingDemo';
import { DragDemo, ThrowDemo } from './demos/GestureDemos';
import { ExtrapolateDemo, InterpolateDemo } from './demos/InterpolationDemos';
import { MathDemo } from './demos/MathDemos';
import { NativeDriverDemo } from './demos/NativeDriverDemo';
import {
  ColorDemo,
  ValueControlDemo,
  ValueDemo,
  ValueXYDemo,
} from './demos/ValueDemos';
import { DemoCard, ScrollLockContext, Section, ValueLabel } from './ui';

const log = createLogger('AnimatedApi');

/**
 * Every part of React Native's core Animated API, with a demo of each.
 * [API (code, not translated), key of where it's shown in `reference.*`].
 */
const API_REFERENCE: [string, string][] = [
  ['Animated.Value / useAnimatedValue', 'values'],
  ['Animated.ValueXY / useAnimatedValueXY', 'valuesGestures'],
  ['Animated.Color / useAnimatedColor', 'values'],
  ['setValue · setOffset · flattenOffset · extractOffset', 'valuesGestures'],
  ['addListener · removeListener', 'valueLabels'],
  ['stopAnimation · resetAnimation', 'values'],
  ['anim.start · stop · reset', 'valuesComposition'],
  ['Animated.timing', 'types'],
  ['Animated.spring (3 configs)', 'types'],
  ['Animated.decay', 'typesGestures'],
  ['Easing.* (14 curves) · in · out · inOut', 'easing'],
  ['Animated.sequence · parallel · stagger', 'composition'],
  ['Animated.delay · loop', 'composition'],
  ['interpolate (numbers, deg, colors, stops)', 'interpolation'],
  ['extrapolate: extend · clamp · identity', 'interpolation'],
  ['Animated.add · subtract · multiply · divide', 'combining'],
  ['Animated.modulo · diffClamp', 'combining'],
  ['Animated.event (scroll) + listener', 'events'],
  ['Animated.event (PanResponder)', 'gestures'],
  ['useNativeDriver', 'nativeDriver'],
  ['Animated.View / Text / ScrollView', 'everywhere'],
  ['Animated.Image / FlatList / SectionList', 'sameAsView'],
  ['Animated.createAnimatedComponent', 'components'],
  ['Animated.forkEvent · unforkEvent · attachNativeEvent', 'advanced'],
];

/**
 * Animated API playground. The screen itself is an Animated.ScrollView whose
 * scroll position (Animated.event) drives the progress bar at the top.
 */
export function AnimatedApiScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t } = useTranslation('animated');
  const scrollY = useAnimatedValue(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [contentHeight, setContentHeight] = useState(1);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const lastY = useRef(0);
  const [viewportHeight, setViewportHeight] = useState(1);
  const maxScroll = Math.max(1, contentHeight - viewportHeight);

  useEffect(() => {
    log.info('Animated API screen opened');
  }, []);

  // The native mapping moves scrollY on the UI thread; `listener` also
  // calls JS with the raw event (here to know the scroll direction).
  // Memoized so the event isn't re-attached on every render.
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const y = e.nativeEvent.contentOffset.y;
          const next = y > lastY.current ? 'down' : 'up';
          lastY.current = y;
          setDirection(current => (current === next ? current : next));
        },
      }),
    [scrollY],
  );

  const progress = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <ScrollLockContext.Provider value={setScrollEnabled}>
      <View style={styles.container}>
        <Animated.View
          style={[styles.progress, { transform: [{ scaleX: progress }] }]}
        />
        <Animated.ScrollView
          scrollEnabled={scrollEnabled}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onContentSizeChange={(_w, h) => setContentHeight(h)}
          onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
        >
          <Text style={styles.intro}>{t('intro')}</Text>

          <Section
            title={t('sections.values.title')}
            subtitle={t('sections.values.subtitle')}
          >
            <ValueDemo />
            <ValueXYDemo />
            <ColorDemo />
            <ValueControlDemo />
          </Section>

          <Section
            title={t('sections.types.title')}
            subtitle={t('sections.types.subtitle')}
          >
            <TimingDemo />
            <SpringDemo />
            <DecayDemo />
          </Section>

          <Section
            title={t('sections.easing.title')}
            subtitle={t('sections.easing.subtitle')}
          >
            <EasingDemo />
          </Section>

          <Section
            title={t('sections.composition.title')}
            subtitle={t('sections.composition.subtitle')}
          >
            <SequenceDemo />
            <ParallelDemo />
            <StaggerDemo />
            <DelayDemo />
            <LoopDemo />
          </Section>

          <Section
            title={t('sections.interpolation.title')}
            subtitle={t('sections.interpolation.subtitle')}
          >
            <InterpolateDemo />
            <ExtrapolateDemo />
          </Section>

          <Section
            title={t('sections.combining.title')}
            subtitle={t('sections.combining.subtitle')}
          >
            <MathDemo />
          </Section>

          <Section
            title={t('sections.events.title')}
            subtitle={t('sections.events.subtitle')}
          >
            <DemoCard
              title={t('scroll.title')}
              api="onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true, listener })}"
              description={t('scroll.description')}
            >
              <ValueLabel value={scrollY} label="scrollY" digits={0} />
              <Text style={styles.direction}>
                {t('scroll.direction', { direction: t(`scroll.${direction}`) })}
              </Text>
            </DemoCard>
            <DragDemo />
            <ThrowDemo />
          </Section>

          <Section
            title={t('sections.nativeDriver.title')}
            subtitle={t('sections.nativeDriver.subtitle')}
          >
            <NativeDriverDemo />
          </Section>

          <Section
            title={t('sections.components.title')}
            subtitle={t('sections.components.subtitle')}
          >
            <CreateAnimatedComponentDemo />
            <AnimatedTextDemo />
          </Section>

          <Section
            title={t('sections.reference.title')}
            subtitle={t('sections.reference.subtitle')}
          >
            <View style={styles.reference}>
              {API_REFERENCE.map(([api, where]) => (
                <View key={api} style={styles.referenceRow}>
                  <Text style={styles.referenceApi}>{api}</Text>
                  <Text style={styles.referenceWhere}>
                    {t(`reference.${where}`)}
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
    backgroundColor: c.primary,
    // scaleX grows from the left edge
    transformOrigin: 'left',
  },
  content: {
    padding: 16,
  },
  direction: {
    fontSize: 12,
    color: c.textMuted,
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
