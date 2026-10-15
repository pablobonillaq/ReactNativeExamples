import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Text, useAnimatedValue } from 'react-native';
import { createLogger } from '../../../observability/logger';
import { useTheme } from '../../../theme';
import { Box, Button, DemoCard, Note, Row, Track, useTravel } from '../ui';

const log = createLogger('AnimatedApi');

function backAndForth(value: Animated.Value, travel: number, native: boolean) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: travel,
        duration: 900,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: native,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 900,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: native,
      }),
    ]),
  );
}

/**
 * useNativeDriver: true sends the whole animation to the UI thread once, so
 * it keeps running even when the JS thread is busy. With false, JS computes
 * every frame and freezes together with JS.
 */
export function NativeDriverDemo() {
  const { t } = useTranslation('animated');
  const { colors } = useTheme();
  const jsValue = useAnimatedValue(0);
  const nativeValue = useAnimatedValue(0);
  const travel = useTravel();
  const loops = useRef<Animated.CompositeAnimation[]>([]);
  const [running, setRunning] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => () => loops.current.forEach(l => l.stop()), []);

  const start = () => {
    loops.current.forEach(l => l.stop());
    loops.current = [
      backAndForth(jsValue, travel, false),
      backAndForth(nativeValue, travel, true),
    ];
    loops.current.forEach(l => l.start());
    setRunning(true);
  };

  const stop = () => {
    loops.current.forEach(l => l.stop());
    setRunning(false);
  };

  const blockJs = () => {
    setBlocked(true);
    // Let React paint "Blocking…" first, then freeze the JS thread.
    setTimeout(() => {
      log.info('Blocking the JS thread for 2 s');
      const end = Date.now() + 2000;
      while (Date.now() < end) {
        // busy wait: nothing else can run on the JS thread
      }
      setBlocked(false);
    }, 50);
  };

  return (
    <DemoCard
      title="useNativeDriver"
      api="Animated.timing(v, { ..., useNativeDriver: true | false })"
      description={t('nativeDriver.description')}
    >
      <Track label={t('nativeDriver.jsTrack')}>
        <Box
          color={colors.amber}
          style={{ transform: [{ translateX: jsValue }] }}
        />
      </Track>
      <Track label={t('nativeDriver.nativeTrack')}>
        <Box
          color={colors.green}
          style={{ transform: [{ translateX: nativeValue }] }}
        />
      </Track>
      {blocked ? (
        <Text style={{ color: colors.text }}>{t('nativeDriver.blocking')}</Text>
      ) : null}
      <Row>
        {running ? (
          <Button
            label={t('nativeDriver.stop')}
            variant="secondary"
            onPress={stop}
          />
        ) : (
          <Button label={t('nativeDriver.start')} onPress={start} />
        )}
        <Button
          label={t('nativeDriver.block')}
          variant="danger"
          onPress={blockJs}
        />
      </Row>
      <Note>{t('nativeDriver.note')}</Note>
    </DemoCard>
  );
}
