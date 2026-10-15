import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';
import Animated, {
  KeyboardState,
  SensorType,
  useAnimatedKeyboard,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { makeStyles, useTheme } from '../../../theme';
import {
  Chips,
  DemoCard,
  Note,
  SharedValueLabel,
  Track,
  useCardWidth,
} from '../ui';

const AREA = 180;
const BALL = 36;

// useAnimatedSensor has one overload for ROTATION (yaw / pitch / roll) and
// another for every other sensor (x / y / z). Typing the values as "any
// sensor except ROTATION" lets TypeScript pick the x / y / z overload.
type Sensor3D = Exclude<SensorType, SensorType.ROTATION>;
type SensorName = 'GRAVITY' | 'ACCELEROMETER' | 'GYROSCOPE' | 'MAGNETIC_FIELD';

const SENSORS: Record<SensorName, Sensor3D> = {
  GRAVITY: SensorType.GRAVITY,
  ACCELEROMETER: SensorType.ACCELEROMETER,
  GYROSCOPE: SensorType.GYROSCOPE,
  MAGNETIC_FIELD: SensorType.MAGNETIC_FIELD,
};

function SensorBall({ type }: { type: SensorName }) {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const width = useCardWidth();
  // The sensor writes into a shared value on the UI thread.
  const { sensor, isAvailable } = useAnimatedSensor(SENSORS[type], {
    interval: 'auto',
  });

  const x = useDerivedValue(() => sensor.value.x);
  const y = useDerivedValue(() => sensor.value.y);

  const style = useAnimatedStyle(() => {
    // Tilting the phone moves the ball (x and y are in m/s², ±9.8 at most
    // for gravity).
    const scale = type === 'MAGNETIC_FIELD' ? 2 : 12;
    return {
      transform: [
        {
          translateX: withSpring(
            Math.min(
              Math.max((width - BALL) / 2 - sensor.value.x * scale, 0),
              width - BALL,
            ),
          ),
        },
        {
          translateY: withSpring(
            Math.min(
              Math.max((AREA - BALL) / 2 + sensor.value.y * scale, 0),
              AREA - BALL,
            ),
          ),
        },
      ],
    };
  });

  return (
    <View>
      <Track height={AREA} style={styles.area}>
        <Animated.View style={[styles.ball, style]} />
      </Track>
      <Text style={styles.status}>
        {isAvailable ? t('sensor.available') : t('sensor.notAvailable')}
      </Text>
      <SharedValueLabel value={x} label="x" />
      <SharedValueLabel value={y} label="y" />
    </View>
  );
}

/** useAnimatedSensor: device sensors as shared values. */
export function SensorDemo() {
  const { t } = useTranslation('reanimated');
  const [type, setType] = useState<SensorName>('GRAVITY');
  return (
    <DemoCard
      title={t('sensor.title')}
      api="const { sensor } = useAnimatedSensor(SensorType.GRAVITY); sensor.value.x"
      description={t('sensor.description')}
    >
      <Chips
        options={Object.keys(SENSORS) as SensorName[]}
        value={type}
        onChange={setType}
      />
      {/* key: a new sensor subscription when the type changes */}
      <SensorBall key={type} type={type} />
      <Note>{t('sensor.note')}</Note>
    </DemoCard>
  );
}

const KEYBOARD_STATES: Record<number, string> = {
  [KeyboardState.UNKNOWN]: 'UNKNOWN',
  [KeyboardState.OPENING]: 'OPENING',
  [KeyboardState.OPEN]: 'OPEN',
  [KeyboardState.CLOSING]: 'CLOSING',
  [KeyboardState.CLOSED]: 'CLOSED',
};

/** useAnimatedKeyboard: keyboard height and state, frame by frame. */
export function KeyboardDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const { colors } = useTheme();
  // Plain strings captured by the animated style worklet.
  const { green, primary } = colors;
  const keyboard = useAnimatedKeyboard();
  const height = useDerivedValue(() => keyboard.height.value);
  const state = useDerivedValue(() => keyboard.state.value);

  const style = useAnimatedStyle(() => ({
    // Grows with the keyboard, frame by frame as it opens.
    height: 24 + keyboard.height.value / 4,
    backgroundColor:
      keyboard.state.value === KeyboardState.OPEN ? green : primary,
  }));

  return (
    <DemoCard
      title={t('keyboard.title')}
      api="const { height, state } = useAnimatedKeyboard()"
      description={t('keyboard.description')}
    >
      <TextInput
        placeholder={t('keyboard.placeholder')}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
      />
      <Animated.View style={[styles.bar, style]} />
      <SharedValueLabel value={height} label="keyboard.height" digits={0} />
      <SharedValueLabel value={state} label="keyboard.state" digits={0} />
      <Text style={styles.status}>
        {Object.entries(KEYBOARD_STATES)
          .map(([n, label]) => `${n} = ${label}`)
          .join(' · ')}
      </Text>
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
    backgroundColor: c.sky,
  },
  status: {
    fontSize: 12,
    color: c.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: c.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: c.text,
    backgroundColor: c.surface,
  },
  bar: {
    borderRadius: 8,
  },
}));
