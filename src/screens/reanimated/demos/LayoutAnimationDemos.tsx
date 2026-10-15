import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  BounceIn,
  BounceOut,
  CurvedTransition,
  EntryExitTransition,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  FadingTransition,
  FlipInEasyX,
  FlipOutEasyX,
  JumpingTransition,
  Keyframe,
  LayoutAnimationConfig,
  LightSpeedInLeft,
  LightSpeedOutRight,
  LinearTransition,
  PinwheelIn,
  PinwheelOut,
  RollInLeft,
  RollOutRight,
  RotateInDownLeft,
  RotateOutDownRight,
  SequencedTransition,
  SlideInLeft,
  SlideOutRight,
  StretchInX,
  StretchOutY,
  ZoomIn,
  ZoomInRotate,
  ZoomOut,
  ZoomOutRotate,
  type ComplexAnimationBuilder,
} from 'react-native-reanimated';
import { makeStyles } from '../../../theme';
import { Button, Chips, DemoCard, logDemo, Note, Row } from '../ui';

type Builder = ComplexAnimationBuilder;

/**
 * Entering / exiting presets (each family has more directions, e.g.
 * FadeInLeft, SlideInUp…). `.delay(0)` turns the preset into an instance so
 * modifiers can be chained on it.
 */
const PRESETS: Record<string, () => { entering: Builder; exiting: Builder }> = {
  Fade: () => ({ entering: FadeIn.delay(0), exiting: FadeOut.delay(0) }),
  'FadeInDown / FadeOutUp': () => ({
    entering: FadeInDown.delay(0),
    exiting: FadeOutUp.delay(0),
  }),
  Slide: () => ({
    entering: SlideInLeft.delay(0),
    exiting: SlideOutRight.delay(0),
  }),
  Zoom: () => ({ entering: ZoomIn.delay(0), exiting: ZoomOut.delay(0) }),
  ZoomRotate: () => ({
    entering: ZoomInRotate.delay(0),
    exiting: ZoomOutRotate.delay(0),
  }),
  Bounce: () => ({ entering: BounceIn.delay(0), exiting: BounceOut.delay(0) }),
  Flip: () => ({
    entering: FlipInEasyX.delay(0),
    exiting: FlipOutEasyX.delay(0),
  }),
  LightSpeed: () => ({
    entering: LightSpeedInLeft.delay(0),
    exiting: LightSpeedOutRight.delay(0),
  }),
  Pinwheel: () => ({
    entering: PinwheelIn.delay(0),
    exiting: PinwheelOut.delay(0),
  }),
  Roll: () => ({
    entering: RollInLeft.delay(0),
    exiting: RollOutRight.delay(0),
  }),
  Rotate: () => ({
    entering: RotateInDownLeft.delay(0),
    exiting: RotateOutDownRight.delay(0),
  }),
  Stretch: () => ({
    entering: StretchInX.delay(0),
    exiting: StretchOutY.delay(0),
  }),
};
const PRESET_NAMES = Object.keys(PRESETS);

const MODIFIERS = [
  'default',
  '.duration(1200)',
  '.springify()',
  '.delay(400)',
] as const;
type Modifier = (typeof MODIFIERS)[number];

/** Builders are chainable: FadeIn.duration(500).delay(200).springify()… */
function applyModifier(builder: Builder, modifier: Modifier): Builder {
  switch (modifier) {
    case '.duration(1200)':
      return builder.duration(1200);
    case '.springify()':
      return builder.springify();
    case '.delay(400)':
      return builder.delay(400);
    default:
      return builder;
  }
}

/** entering / exiting: animate a view when it mounts and unmounts. */
export function EnteringExitingDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const [visible, setVisible] = useState(true);
  const [name, setName] = useState('Bounce');
  const [modifier, setModifier] = useState<Modifier>('default');
  const preset = PRESETS[name]();
  const entering = applyModifier(preset.entering, modifier);
  const exiting = applyModifier(preset.exiting, modifier);

  return (
    <DemoCard
      title={t('enteringExiting.title')}
      api={`<Animated.View entering={…In${
        modifier === 'default' ? '' : modifier
      }} exiting={…Out} />  (${name})`}
      description={t('enteringExiting.description')}
    >
      <View style={styles.stage}>
        {visible ? (
          <Animated.View
            // A new key remounts the box so the new preset is used.
            key={`${name}-${modifier}`}
            entering={entering}
            exiting={exiting}
            style={styles.box}
          >
            <Text style={styles.boxText}>{name}</Text>
          </Animated.View>
        ) : null}
      </View>
      <Chips options={PRESET_NAMES} value={name} onChange={setName} />
      <Chips options={MODIFIERS} value={modifier} onChange={setModifier} />
      <Button
        label={visible ? t('enteringExiting.remove') : t('enteringExiting.add')}
        onPress={() => {
          logDemo('layout animation', {
            preset: name,
            modifier,
            show: !visible,
          });
          setVisible(!visible);
        }}
      />
    </DemoCard>
  );
}

const TRANSITIONS = {
  LinearTransition,
  SequencedTransition,
  FadingTransition,
  JumpingTransition,
  CurvedTransition,
  EntryExitTransition,
};
type TransitionName = keyof typeof TRANSITIONS;
const TRANSITION_NAMES = Object.keys(TRANSITIONS) as TransitionName[];

let nextId = 4;

/** layout: animate position / size changes of views that stay mounted. */
export function LayoutTransitionDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const [items, setItems] = useState([1, 2, 3]);
  const [name, setName] = useState<TransitionName>('LinearTransition');
  const layout = TRANSITIONS[name];

  const remove = (id: number) => setItems(list => list.filter(i => i !== id));

  return (
    <DemoCard
      title={t('layoutTransition.title')}
      api={`<Animated.View layout={${name}} entering={FadeIn} exiting={FadeOut} />`}
      description={t('layoutTransition.description')}
    >
      <Chips options={TRANSITION_NAMES} value={name} onChange={setName} />
      <View style={styles.items}>
        {items.map(id => (
          <Animated.View
            key={id}
            layout={layout}
            entering={FadeIn}
            exiting={FadeOut}
            style={[styles.item, { width: 40 + (id % 3) * 24 }]}
          >
            <Pressable onPress={() => remove(id)} style={styles.itemPress}>
              <Text style={styles.boxText}>{id}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      <Row>
        <Button
          label={t('layoutTransition.addAtStart')}
          onPress={() => setItems(list => [nextId++, ...list])}
        />
        <Button
          label={t('layoutTransition.shuffle')}
          variant="secondary"
          onPress={() =>
            setItems(list => [...list].sort(() => Math.random() - 0.5))
          }
        />
      </Row>
    </DemoCard>
  );
}

/** Keyframe: a custom entering / exiting animation in steps (0 → 100). */
const wobbleIn = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '-45deg' }] },
  40: { opacity: 1, transform: [{ scale: 1.2 }, { rotate: '20deg' }] },
  70: { transform: [{ scale: 0.9 }, { rotate: '-10deg' }] },
  100: { transform: [{ scale: 1 }, { rotate: '0deg' }] },
}).duration(900);

const dropOut = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }] },
  100: { opacity: 0, transform: [{ translateY: 80 }] },
}).duration(500);

export function KeyframeDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const [visible, setVisible] = useState(true);
  return (
    <DemoCard
      title={t('keyframe.title')}
      api="new Keyframe({ 0: {…}, 40: {…}, 100: {…} }).duration(900)"
      description={t('keyframe.description')}
    >
      <View style={styles.stage}>
        {visible ? (
          <Animated.View
            entering={wobbleIn}
            exiting={dropOut}
            style={styles.box}
          >
            <Text style={styles.boxText}>Keyframe</Text>
          </Animated.View>
        ) : null}
      </View>
      <Button
        label={visible ? t('common.remove') : t('common.add')}
        onPress={() => setVisible(!visible)}
      />
    </DemoCard>
  );
}

/** LayoutAnimationConfig: skip entering / exiting for a whole subtree. */
export function LayoutAnimationConfigDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const [skip, setSkip] = useState<'skip' | 'animate'>('skip');
  const [round, setRound] = useState(0);
  return (
    <DemoCard
      title={t('layoutAnimationConfig.title')}
      api="<LayoutAnimationConfig skipEntering skipExiting>…</LayoutAnimationConfig>"
      description={t('layoutAnimationConfig.description')}
    >
      <Chips
        options={['skip', 'animate'] as const}
        value={skip}
        onChange={setSkip}
      />
      <LayoutAnimationConfig
        key={`${skip}-${round}`}
        skipEntering={skip === 'skip'}
      >
        <View style={styles.items}>
          {[1, 2, 3, 4].map(i => (
            <Animated.View
              key={i}
              entering={ZoomIn.delay(i * 120)}
              style={[styles.item, styles.smallItem]}
            >
              <Text style={styles.boxText}>{i}</Text>
            </Animated.View>
          ))}
        </View>
      </LayoutAnimationConfig>
      <Button
        label={t('layoutAnimationConfig.remount')}
        onPress={() => setRound(r => r + 1)}
      />
      <Note>{t('layoutAnimationConfig.note')}</Note>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  stage: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surfaceAlt,
    borderRadius: 10,
    overflow: 'hidden',
  },
  box: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: c.primary,
  },
  boxText: {
    color: c.textOnPrimary,
    fontWeight: '700',
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 48,
  },
  item: {
    height: 44,
    borderRadius: 10,
    backgroundColor: c.pink,
  },
  smallItem: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.green,
  },
  itemPress: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
