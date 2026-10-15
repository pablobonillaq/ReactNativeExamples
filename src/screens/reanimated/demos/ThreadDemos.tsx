import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { isUIRuntime } from 'react-native-worklets';
import { makeStyles, useTheme } from '../../../theme';
import {
  Button,
  DemoCard,
  logDemo,
  Note,
  RBox,
  Row,
  SharedValueLabel,
  Track,
  useCardWidth,
  useTravel,
} from '../ui';

const AREA = 160;
const BALL = 28;

/** useFrameCallback: run a worklet on every frame (a tiny physics engine). */
export function FrameCallbackDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const width = useCardWidth();
  const x = useSharedValue(20);
  const y = useSharedValue(20);
  const vx = useSharedValue(180); // px per second
  const vy = useSharedValue(0);
  const fps = useSharedValue(0);

  const frame = useFrameCallback(info => {
    const dt = (info.timeSincePreviousFrame ?? 16) / 1000;
    if (info.timeSincePreviousFrame) {
      fps.value = 1000 / info.timeSincePreviousFrame;
    }
    vy.value += 900 * dt; // gravity
    x.value += vx.value * dt;
    y.value += vy.value * dt;
    // Bounce off the walls, losing a bit of energy on the floor.
    if (x.value < 0 || x.value > width - BALL) {
      vx.value = -vx.value;
      x.value = Math.min(Math.max(x.value, 0), width - BALL);
    }
    if (y.value > AREA - BALL) {
      y.value = AREA - BALL;
      vy.value = -vy.value * 0.85;
    }
  }, false);

  // Don't keep computing frames after leaving the screen.
  useEffect(() => () => frame.setActive(false), [frame]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <DemoCard
      title={t('frameCallback.title')}
      api="useFrameCallback(({ timeSincePreviousFrame }) => { … }, autostart)"
      description={t('frameCallback.description')}
    >
      <Track height={AREA} style={styles.area}>
        <Animated.View style={[styles.ball, style]} />
      </Track>
      <SharedValueLabel value={fps} label="fps" digits={0} />
      <Row>
        <Button
          label={t('common.start')}
          onPress={() => {
            vy.value = -300;
            frame.setActive(true);
          }}
        />
        <Button
          label={t('common.stop')}
          variant="secondary"
          onPress={() => frame.setActive(false)}
        />
      </Row>
    </DemoCard>
  );
}

/** runOnUI / runOnJS: move work between the two threads. */
export function ThreadHopDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const [result, setResult] = useState<{
    value: number;
    thread: string;
  } | null>(null);
  const counter = useSharedValue(0);

  const showResult = (value: number, thread: string) => {
    setResult({ value, thread });
    logDemo('runOnUI result', { value });
  };

  const run = () => {
    // runOnUI(worklet)(args): runs on the UI thread, asynchronously.
    runOnUI((times: number) => {
      let sum = 0;
      for (let i = 1; i <= times; i++) {
        sum += i;
      }
      counter.value += 1;
      const thread = isUIRuntime() ? 'UI' : 'JS';
      // runOnJS(fn)(args): call a normal JS function from a worklet.
      runOnJS(showResult)(sum, thread);
    })(1000);
  };

  return (
    <DemoCard
      title={t('threadHop.title')}
      api="runOnUI(worklet)(args) · runOnJS(jsFunction)(args)"
      description={t('threadHop.description')}
    >
      <Text style={styles.text}>
        {result
          ? t('threadHop.result', {
              value: result.value,
              thread: result.thread,
            })
          : t('threadHop.pressTheButton')}
      </Text>
      <SharedValueLabel
        value={counter}
        label={t('threadHop.runs')}
        digits={0}
      />
      <Button label={t('threadHop.sum')} onPress={run} />
      <Note>{t('threadHop.note')}</Note>
    </DemoCard>
  );
}

/** Animations run on the UI thread, so a busy JS thread doesn't stop them. */
export function UIThreadDemo() {
  const { t } = useTranslation('reanimated');
  const styles = useStyles();
  const { colors } = useTheme();
  const travel = useTravel();
  const x = useSharedValue(0);
  const [jsX, setJsX] = useState(0);
  const [running, setRunning] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // Reanimated: animated on the UI thread.
  useEffect(() => {
    if (!running) {
      cancelAnimation(x);
      return;
    }
    x.value = 0;
    x.value = withRepeat(
      withTiming(travel, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(x);
  }, [running, travel, x]);

  // React state + setInterval: every frame goes through JS.
  useEffect(() => {
    if (!running) {
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      const phase = ((Date.now() - start) % 1800) / 900;
      setJsX((phase <= 1 ? phase : 2 - phase) * travel);
    }, 16);
    return () => clearInterval(id);
  }, [running, travel]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const blockJs = () => {
    setBlocked(true);
    setTimeout(() => {
      logDemo('Blocking the JS thread for 2 s');
      const end = Date.now() + 2000;
      while (Date.now() < end) {
        // busy wait
      }
      setBlocked(false);
    }, 50);
  };

  return (
    <DemoCard
      title={t('uiThread.title')}
      api="sv.value = withRepeat(withTiming(W), -1, true)"
      description={t('uiThread.description')}
    >
      <Track label={t('uiThread.jsLane')}>
        <View style={[styles.jsBox, { transform: [{ translateX: jsX }] }]} />
      </Track>
      <Track label={t('uiThread.uiLane')}>
        <RBox color={colors.green} style={style} />
      </Track>
      {blocked ? (
        <Text style={styles.text}>{t('uiThread.blocking')}</Text>
      ) : null}
      <Row>
        <Button
          label={running ? t('common.stop') : t('uiThread.startBoth')}
          variant={running ? 'secondary' : 'primary'}
          onPress={() => setRunning(!running)}
        />
        <Button
          label={t('uiThread.block')}
          variant="danger"
          onPress={blockJs}
        />
      </Row>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  text: {
    color: c.text,
  },
  area: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  ball: {
    width: BALL,
    height: BALL,
    borderRadius: BALL / 2,
    backgroundColor: c.pink,
  },
  jsBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: c.amber,
  },
}));
