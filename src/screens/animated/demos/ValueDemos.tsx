import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  Text,
  useAnimatedColor,
  useAnimatedValue,
  useAnimatedValueXY,
} from 'react-native';
import { makeStyles, useTheme, type ThemeColors } from '../../../theme';
import {
  BOX,
  Box,
  Button,
  DemoCard,
  Note,
  play,
  Row,
  Track,
  useCardWidth,
  useTravel,
  ValueLabel,
} from '../ui';

/** Animated.Value + useAnimatedValue + setValue. */
export function ValueDemo() {
  const { t } = useTranslation('animated');
  // useAnimatedValue keeps the same Animated.Value across renders
  // (same as useRef(new Animated.Value(0)).current).
  const value = useAnimatedValue(0);
  const travel = useTravel();
  const translateX = value.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travel],
  });

  return (
    <DemoCard
      title="Animated.Value"
      api="const v = useAnimatedValue(0); v.setValue(1)"
      description={t('value.description')}
    >
      <Track>
        <Box style={{ transform: [{ translateX }] }} />
      </Track>
      <ValueLabel value={value} />
      <Row>
        <Button
          label="setValue(0)"
          variant="secondary"
          onPress={() => value.setValue(0)}
        />
        <Button
          label="setValue(0.5)"
          variant="secondary"
          onPress={() => value.setValue(0.5)}
        />
        <Button
          label="setValue(1)"
          variant="secondary"
          onPress={() => value.setValue(1)}
        />
        <Button
          label="setOffset(0.25)"
          variant="secondary"
          onPress={() => value.setOffset(0.25)}
        />
        <Button
          label="flattenOffset()"
          variant="secondary"
          onPress={() => value.flattenOffset()}
        />
        <Button
          label="timing → 1"
          onPress={() => {
            value.setValue(0);
            play(
              'Value timing',
              Animated.timing(value, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
            );
          }}
        />
      </Row>
    </DemoCard>
  );
}

/** Animated.ValueXY: two values (x, y) animated together. */
export function ValueXYDemo() {
  const { t } = useTranslation('animated');
  const { colors } = useTheme();
  const styles = useStyles();
  const width = useCardWidth();
  const height = 140;
  const position = useAnimatedValueXY({ x: 0, y: 0 });

  const moveToRandomPoint = () =>
    play(
      'ValueXY',
      Animated.spring(position, {
        toValue: {
          x: Math.random() * (width - BOX),
          y: Math.random() * (height - BOX),
        },
        friction: 6,
        useNativeDriver: true,
      }),
    );

  return (
    <DemoCard
      title="Animated.ValueXY"
      api="useAnimatedValueXY({ x: 0, y: 0 }).getTranslateTransform()"
      description={t('valueXY.description')}
    >
      <Track height={height} style={styles.topLeft}>
        <Box
          color={colors.pink}
          label="XY"
          style={{ transform: position.getTranslateTransform() }}
        />
      </Track>
      <Row>
        <Button label={t('valueXY.random')} onPress={moveToRandomPoint} />
        <Button
          label="setValue({ x: 0, y: 0 })"
          variant="secondary"
          onPress={() => position.setValue({ x: 0, y: 0 })}
        />
      </Row>
    </DemoCard>
  );
}

/** Colors to blend to: a name (key in `color.names`) and a theme token. */
const PALETTE: { name: string; token: keyof ThemeColors }[] = [
  { name: 'indigo', token: 'primary' },
  { name: 'pink', token: 'pink' },
  { name: 'green', token: 'green' },
  { name: 'amber', token: 'amber' },
];

/** '#4f46e5' → [79, 70, 229] (theme tokens used here are 6-digit hex). */
function hexToRgb(hex: string) {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
}

/**
 * Animated.Color (useAnimatedColor): a color made of four Animated.Values
 * (r, g, b, a). Each channel can be animated like any other value.
 */
export function ColorDemo() {
  const { t } = useTranslation('animated');
  const { colors } = useTheme();
  // Starts at the primary color of the theme in use when it mounts.
  const color = useAnimatedColor(colors.primary);
  const [current, setCurrent] = useState(0);

  const goTo = (index: number) => {
    const [r, g, b] = hexToRgb(colors[PALETTE[index].token]);
    const channels: [Animated.Value, number][] = [
      [color.r, r],
      [color.g, g],
      [color.b, b],
    ];
    setCurrent(index);
    play(
      `Animated.Color → ${PALETTE[index].name}`,
      Animated.parallel(
        channels.map(([channel, toValue]) =>
          Animated.timing(channel, {
            toValue,
            duration: 700,
            useNativeDriver: false,
          }),
        ),
      ),
    );
  };

  // Animated.Color works as a color prop at runtime, but React Native's
  // TypeScript types don't list it yet, hence the cast.
  const backgroundColor = color as unknown as string;

  return (
    <DemoCard
      title="Animated.Color"
      api="const c = useAnimatedColor('red'); Animated.timing(c.r, { toValue })"
      description={t('color.description')}
    >
      <Track>
        <Box style={{ backgroundColor }} />
      </Track>
      <Row>
        {PALETTE.map((p, i) => (
          <Button
            key={p.name}
            label={t(`color.names.${p.name}`)}
            variant={i === current ? 'primary' : 'secondary'}
            onPress={() => goTo(i)}
          />
        ))}
      </Row>
      <Button
        label="setValue('black')"
        variant="secondary"
        onPress={() => {
          color.setValue('black');
          setCurrent(-1);
        }}
      />
    </DemoCard>
  );
}

/** Status shown under the box: a key in `control.messages` (+ value). */
type ControlMessage = {
  key:
    | 'idle'
    | 'running'
    | 'finished'
    | 'interrupted'
    | 'stopped'
    | 'reset'
    | 'animReset';
  value?: string;
};

/** addListener, stopAnimation, resetAnimation and animation.stop/reset. */
export function ValueControlDemo() {
  const { t } = useTranslation('animated');
  const { colors } = useTheme();
  const styles = useStyles();
  const value = useAnimatedValue(0);
  const travel = useTravel();
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const [message, setMessage] = useState<ControlMessage>({ key: 'idle' });

  const translateX = value.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travel],
  });

  const start = () => {
    animation.current = Animated.timing(value, {
      toValue: 1,
      duration: 4000,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    setMessage({ key: 'running' });
    play('Value control', animation.current, finished =>
      setMessage({ key: finished ? 'finished' : 'interrupted' }),
    );
  };

  return (
    <DemoCard
      title={t('control.title')}
      api="addListener · stopAnimation(cb) · resetAnimation(cb) · anim.stop() · anim.reset()"
      description={t('control.description')}
    >
      <Track>
        <Box color={colors.green} style={{ transform: [{ translateX }] }} />
      </Track>
      <ValueLabel value={value} />
      <Text style={styles.message}>
        {t(`control.messages.${message.key}`, { value: message.value })}
      </Text>
      <Row>
        <Button label={t('control.start')} onPress={start} />
        <Button
          label="stopAnimation"
          variant="secondary"
          onPress={() =>
            value.stopAnimation(v =>
              setMessage({ key: 'stopped', value: v.toFixed(2) }),
            )
          }
        />
        <Button
          label="resetAnimation"
          variant="secondary"
          onPress={() =>
            value.resetAnimation(v =>
              setMessage({ key: 'reset', value: v.toFixed(2) }),
            )
          }
        />
        <Button
          label="anim.reset()"
          variant="secondary"
          onPress={() => {
            animation.current?.reset();
            setMessage({ key: 'animReset' });
          }}
        />
      </Row>
      <Note>{t('control.note')}</Note>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  topLeft: {
    justifyContent: 'flex-start',
  },
  message: {
    color: c.text,
  },
}));
