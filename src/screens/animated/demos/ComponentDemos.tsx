import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Pressable,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import { makeStyles, useTheme } from '../../../theme';
import { Button, DemoCard, Note, play, ValueLabel } from '../ui';

/**
 * Animated.createAnimatedComponent makes any component accept Animated
 * values in its props (here Pressable).
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CreateAnimatedComponentDemo() {
  const { t } = useTranslation('animated');
  const styles = useStyles();
  const scale = useAnimatedValue(1);
  const [presses, setPresses] = useState(0);

  const springTo = (toValue: number) =>
    play(
      'press scale',
      Animated.spring(scale, {
        toValue,
        speed: 40,
        bounciness: toValue === 1 ? 12 : 0,
        useNativeDriver: true,
      }),
    );

  return (
    <DemoCard
      title="Animated.createAnimatedComponent"
      api="const AnimatedPressable = Animated.createAnimatedComponent(Pressable)"
      description={t('createComponent.description')}
    >
      <View style={styles.center}>
        <AnimatedPressable
          onPressIn={() => springTo(0.9)}
          onPressOut={() => springTo(1)}
          onPress={() => setPresses(p => p + 1)}
          accessibilityRole="button"
          style={[styles.pressable, { transform: [{ scale }] }]}
        >
          <Text style={styles.pressableText}>
            {t('createComponent.pressMe', { presses })}
          </Text>
        </AnimatedPressable>
      </View>
    </DemoCard>
  );
}

/** Animated.Text with animated color, size and letter spacing. */
export function AnimatedTextDemo() {
  const { t } = useTranslation('animated');
  const { colors } = useTheme();
  const styles = useStyles();
  const progress = useAnimatedValue(0);
  const [atEnd, setAtEnd] = useState(false);

  const run = () => {
    setAtEnd(!atEnd);
    play(
      'Animated.Text',
      Animated.timing(progress, {
        toValue: atEnd ? 0 : 1,
        duration: 900,
        // fontSize and letterSpacing affect layout: JS driver only.
        useNativeDriver: false,
      }),
    );
  };

  return (
    <DemoCard
      title="Animated.Text"
      api="<Animated.Text style={{ fontSize, color, letterSpacing }} />"
      description={t('text.description')}
    >
      <View style={styles.textBox}>
        <Animated.Text
          style={[
            styles.text,
            {
              fontSize: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 30],
              }),
              letterSpacing: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 6],
              }),
              color: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [colors.text, colors.pink],
              }),
            },
          ]}
        >
          Animated
        </Animated.Text>
      </View>
      <ValueLabel value={progress} label="progress" />
      <Button label={atEnd ? t('text.shrink') : t('text.grow')} onPress={run} />
      <Note>{t('text.note')}</Note>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  center: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  pressable: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: c.primary,
  },
  pressableText: {
    color: c.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  textBox: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
  },
}));
