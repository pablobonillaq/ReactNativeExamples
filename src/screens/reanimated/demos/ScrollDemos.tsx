import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  measure,
  runOnJS,
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useScrollOffset,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { makeStyles, useTheme, type ThemeColors } from '../../../theme';
import {
  Button,
  DemoCard,
  Note,
  Row,
  SharedValueLabel,
  useCardWidth,
} from '../ui';

/** One theme accent per carousel card. */
const CARD_COLORS: (keyof ThemeColors)[] = [
  'primary',
  'pink',
  'green',
  'amber',
  'sky',
  'purple',
];

function CarouselCard({
  index,
  scrollX,
  itemWidth,
}: {
  index: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  // The centered card is full size; its neighbours shrink and fade.
  const style = useAnimatedStyle(() => {
    const position = scrollX.value / itemWidth - index;
    return {
      opacity: interpolate(
        position,
        [-1, 0, 1],
        [0.4, 1, 0.4],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            position,
            [-1, 0, 1],
            [0.8, 1, 0.8],
            Extrapolation.CLAMP,
          ),
        },
        {
          rotate: `${interpolate(position, [-1, 0, 1], [8, 0, -8], Extrapolation.CLAMP)}deg`,
        },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.card,
        { width: itemWidth, backgroundColor: colors[CARD_COLORS[index]] },
        style,
      ]}
    >
      <Text style={styles.cardText}>{index + 1}</Text>
    </Animated.View>
  );
}

/**
 * useAnimatedScrollHandler: scroll events handled on the UI thread, with
 * every phase (scroll, drag begin/end, momentum begin/end) and a context.
 */
type Phase = {
  /** Text id under scrollHandler.phases. */
  id: 'swipe' | 'beginDrag' | 'endDrag' | 'momentumBegin' | 'momentumEnd';
  value?: number;
};

export function ScrollHandlerDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const itemWidth = useCardWidth();
  const scrollX = useSharedValue(0);
  const [phase, setPhase] = useState<Phase>({ id: 'swipe' });

  const onScroll = useAnimatedScrollHandler<{ startX: number }>({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
    },
    onBeginDrag: (event, context) => {
      context.startX = event.contentOffset.x;
      runOnJS(setPhase)({ id: 'beginDrag' });
    },
    onEndDrag: (event, context) => {
      const moved = Math.round(event.contentOffset.x - context.startX);
      runOnJS(setPhase)({ id: 'endDrag', value: moved });
    },
    onMomentumBegin: () => {
      runOnJS(setPhase)({ id: 'momentumBegin' });
    },
    onMomentumEnd: event => {
      const page = Math.round(event.contentOffset.x / itemWidth) + 1;
      runOnJS(setPhase)({ id: 'momentumEnd', value: page });
    },
  });

  return (
    <DemoCard
      title={t('scrollHandler.title')}
      api="useAnimatedScrollHandler({ onScroll, onBeginDrag, onEndDrag, onMomentumBegin, onMomentumEnd })"
      description={t('scrollHandler.description')}
    >
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ width: itemWidth }}
      >
        {CARD_COLORS.map((_, i) => (
          <CarouselCard
            key={i}
            index={i}
            scrollX={scrollX}
            itemWidth={itemWidth}
          />
        ))}
      </Animated.ScrollView>
      <SharedValueLabel value={scrollX} label="scrollX" digits={0} />
      <Text style={styles.phase}>
        {t(`scrollHandler.phases.${phase.id}`, { value: phase.value })}
      </Text>
    </DemoCard>
  );
}

/** useAnimatedRef + useScrollOffset + scrollTo + measure. */
export function ScrollToMeasureDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const listRef = useAnimatedRef<Animated.ScrollView>();
  const boxRef = useAnimatedRef<Animated.View>();
  // Kept in sync with the scroll position, no handler needed.
  const offset = useScrollOffset(listRef);
  const [measured, setMeasured] = useState('');

  const scrollBy = (delta: number) => {
    // scrollTo runs on the UI thread: call it from a worklet.
    runOnUI(() => {
      scrollTo(listRef, 0, Math.max(0, offset.value + delta), true);
    })();
  };

  const measureBox = () => {
    runOnUI(() => {
      const m = measure(boxRef);
      if (m) {
        runOnJS(setMeasured)(
          `x ${m.pageX.toFixed(0)}, y ${m.pageY.toFixed(0)}, ` +
            `${m.width.toFixed(0)}×${m.height.toFixed(0)}`,
        );
      }
    })();
  };

  return (
    <DemoCard
      title={t('scrollTo.title')}
      api="scrollTo(ref, x, y, animated) · measure(ref) — both inside runOnUI"
      description={t('scrollTo.description')}
    >
      <Animated.ScrollView
        ref={listRef}
        style={styles.list}
        nestedScrollEnabled
      >
        {Array.from({ length: 20 }, (_, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.rowText}>
              {t('scrollTo.row', { number: i + 1 })}
            </Text>
          </View>
        ))}
      </Animated.ScrollView>
      <SharedValueLabel value={offset} label="useScrollOffset" digits={0} />
      <Row>
        <Button label="scrollTo +120" onPress={() => scrollBy(120)} />
        <Button
          label={t('scrollTo.top')}
          variant="secondary"
          onPress={() => scrollBy(-10000)}
        />
      </Row>
      <Animated.View ref={boxRef} style={styles.measureBox}>
        <Text style={styles.measureText}>{t('scrollTo.measureMe')}</Text>
      </Animated.View>
      <Button label="measure(boxRef)" onPress={measureBox} />
      {measured ? <Text style={styles.phase}>{measured}</Text> : null}
      <Note>{t('scrollTo.note')}</Note>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  card: {
    height: 140,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: c.textOnPrimary,
    fontSize: 40,
    fontWeight: '800',
  },
  phase: {
    fontSize: 12,
    color: c.textMuted,
    fontFamily: 'monospace',
  },
  list: {
    height: 160,
    borderRadius: 10,
    backgroundColor: c.surfaceAlt,
  },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.borderStrong,
  },
  rowText: {
    color: c.text,
  },
  measureBox: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: c.green,
  },
  measureText: {
    color: c.textOnPrimary,
    fontWeight: '700',
  },
}));
