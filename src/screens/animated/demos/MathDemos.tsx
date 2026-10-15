import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useAnimatedValue,
} from 'react-native';
import { useTheme } from '../../../theme';
import { Box, Button, DemoCard, Note, play, Track, useTravel } from '../ui';

const SIZE = 32;

/**
 * Animated.add / subtract / multiply / divide / modulo / diffClamp combine
 * values into new animated nodes, without JS code running on every frame.
 */
export function MathDemo() {
  const x = useAnimatedValue(0);
  const travel = useTravel() + 12; // 32 px boxes
  const { t } = useTranslation('animated');
  const { colors } = useTheme();

  const lanes = useMemo(() => {
    const constant = (n: number) => new Animated.Value(n);
    // `note`: key in `math.*` shown after the code.
    return [
      { api: 'x', node: x, color: colors.text },
      {
        api: 'Animated.add(x, 40)',
        node: Animated.add(x, constant(40)),
        color: colors.primary,
      },
      {
        api: 'Animated.subtract(W, x)',
        note: 'mirrored',
        node: Animated.subtract(constant(travel), x),
        color: colors.pink,
      },
      {
        api: 'Animated.multiply(x, 0.5)',
        node: Animated.multiply(x, constant(0.5)),
        color: colors.green,
      },
      {
        api: 'Animated.divide(x, 4)',
        node: Animated.divide(x, constant(4)),
        color: colors.sky,
      },
      {
        api: 'Animated.modulo(x, W / 3)',
        note: 'wraps',
        node: Animated.modulo(x, travel / 3),
        color: colors.amber,
      },
      {
        api: 'Animated.diffClamp(x, 0, 60)',
        node: Animated.diffClamp(x, 0, 60),
        color: colors.purple,
      },
    ];
  }, [x, travel, colors]);

  const run = () =>
    play(
      'math',
      Animated.sequence([
        Animated.timing(x, {
          toValue: travel,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(x, {
          toValue: 0,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );

  return (
    <DemoCard
      title={t('math.title')}
      api="Animated.add · subtract · multiply · divide · modulo · diffClamp"
      description={t('math.description')}
    >
      <View style={styles.lanes}>
        {lanes.map(lane => (
          <Track
            key={lane.api}
            label={
              lane.note ? `${lane.api}  ← ${t(`math.${lane.note}`)}` : lane.api
            }
            height={SIZE + 8}
          >
            <Box
              size={SIZE}
              color={lane.color}
              style={{ transform: [{ translateX: lane.node }] }}
            />
          </Track>
        ))}
      </View>
      <Note>{t('math.note')}</Note>
      <Button label={t('math.run')} onPress={run} />
    </DemoCard>
  );
}

const styles = StyleSheet.create({
  lanes: {
    gap: 8,
  },
});
