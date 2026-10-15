import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { TickEvent } from '../../../specs/NativeBridgeDemo';
import { createLogger } from '../../observability/logger';
import { makeStyles } from '../../theme';
import { Button, DemoCard, Note, Result } from '../flipper/flipperUi';
import {
  getBridge,
  runBridgeBenchmark,
  timed,
  timedAsync,
  type BenchmarkResult,
} from './bridgeModule';

const log = createLogger('Bridging');

const NATIVE_LANGUAGE = Platform.OS === 'ios' ? 'Objective-C++' : 'Kotlin';

function ms(value: number) {
  return value < 0.1
    ? `${(value * 1000).toFixed(1)} µs`
    : `${value.toFixed(2)} ms`;
}

/** Shown in a demo when the native module isn't in the installed app. */
function Missing() {
  const { t } = useTranslation('bridging');
  return <Result>{t('missing')}</Result>;
}

// =====================================================================
// 1. Sync calls
// =====================================================================

export function SyncCallDemo() {
  const bridge = getBridge();
  const { t } = useTranslation('bridging');
  const [result, setResult] = useState('');

  const run = () => {
    if (!bridge) {
      return;
    }
    const thread = timed(() => bridge.currentThread());
    const sum = timed(() => bridge.add(2, 3));
    setResult(
      `currentThread() → "${thread.value}" (${ms(thread.ms)})\n` +
        `add(2, 3) → ${sum.value} (${ms(sum.ms)})`,
    );
  };

  return (
    <DemoCard
      title={t('sync.title')}
      api="const thread = NativeBridgeDemo.currentThread();"
      description={t('sync.description', { language: NATIVE_LANGUAGE })}
    >
      {bridge ? (
        <Button label={t('buttons.currentThread')} onPress={run} />
      ) : (
        <Missing />
      )}
      <Result>{result}</Result>
    </DemoCard>
  );
}

// =====================================================================
// 2. Async calls (Promise)
// =====================================================================

export function AsyncCallDemo() {
  const bridge = getBridge();
  const { t } = useTranslation('bridging');
  const [result, setResult] = useState('');

  const run = async () => {
    if (!bridge) {
      return;
    }
    const sync = bridge.currentThread();
    const thread = await timedAsync(() => bridge.asyncThread());
    const sum = await timedAsync(() => bridge.addAsync(2, 3));
    setResult(
      `asyncThread() → "${thread.value}" (${ms(thread.ms)})\n` +
        `addAsync(2, 3) → ${sum.value} (${ms(sum.ms)})\n` +
        t('async.otherThread', { thread: sync }),
    );
  };

  return (
    <DemoCard
      title={t('async.title')}
      api="const sum = await NativeBridgeDemo.addAsync(2, 3);"
      description={t('async.description')}
    >
      {bridge ? (
        <Button label={t('buttons.asyncThread')} onPress={run} />
      ) : (
        <Missing />
      )}
      <Result>{result}</Result>
    </DemoCard>
  );
}

// =====================================================================
// 3. Callbacks
// =====================================================================

export function CallbackDemo() {
  const bridge = getBridge();
  const { t } = useTranslation('bridging');
  const [result, setResult] = useState('');

  return (
    <DemoCard
      title={t('callback.title')}
      api="NativeBridgeDemo.withCallback(21, message => …)"
      description={t('callback.description')}
    >
      {bridge ? (
        <Button
          label={t('buttons.withCallback')}
          onPress={() => bridge.withCallback(21, setResult)}
        />
      ) : (
        <Missing />
      )}
      <Result>{result}</Result>
    </DemoCard>
  );
}

// =====================================================================
// 4. Events (native → JS)
// =====================================================================

export function EventsDemo() {
  const bridge = getBridge();
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState<TickEvent | null>(null);
  const [latency, setLatency] = useState(0);
  const styles = useStyles();
  const { t } = useTranslation('bridging');

  useEffect(() => {
    if (!bridge) {
      return;
    }
    // onTick comes from `readonly onTick: EventEmitter<TickEvent>` in the spec.
    const subscription = bridge.onTick(event => {
      setLast(event);
      setLatency(Date.now() - event.timestamp);
    });
    return () => {
      subscription.remove();
      bridge.stopTicking();
    };
  }, [bridge]);

  const toggle = () => {
    if (!bridge) {
      return;
    }
    if (running) {
      bridge.stopTicking();
      log.info('Stopped native ticks');
    } else {
      bridge.startTicking(500);
      log.info('Started native ticks');
    }
    setRunning(!running);
  };

  return (
    <DemoCard
      title={t('events.title')}
      api="const sub = NativeBridgeDemo.onTick(event => …); sub.remove();"
      description={t('events.description', { language: NATIVE_LANGUAGE })}
    >
      {bridge ? (
        <Button
          label={running ? 'stopTicking()' : 'startTicking(500)'}
          variant={running ? 'secondary' : 'primary'}
          onPress={toggle}
        />
      ) : (
        <Missing />
      )}
      {last ? (
        <View style={styles.tick}>
          <Text style={styles.tickCount}>{last.count}</Text>
          <Text style={styles.tickInfo}>
            {t('events.tickInfo', { thread: last.thread, latency })}
          </Text>
        </View>
      ) : null}
    </DemoCard>
  );
}

// =====================================================================
// 5. Type conversion
// =====================================================================

const SAMPLE = {
  text: 'hola',
  integer: 42,
  decimal: 3.14,
  flag: true,
  nothing: null,
  list: [1, 2, 3],
  nested: { a: 1, b: 'x' },
};

function jsType(value: unknown) {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'Array';
  }
  return typeof value;
}

export function TypesDemo() {
  const bridge = getBridge();
  const [native, setNative] = useState<Record<string, string> | null>(null);
  const styles = useStyles();
  const { t } = useTranslation('bridging');

  return (
    <DemoCard
      title={t('types.title')}
      api="NativeBridgeDemo.echo({ text: 'hola', integer: 42, … })"
      description={t('types.description', { language: NATIVE_LANGUAGE })}
    >
      {bridge ? (
        <Button
          label={t('types.send')}
          onPress={() =>
            setNative(bridge.echo(SAMPLE) as Record<string, string>)
          }
        />
      ) : (
        <Missing />
      )}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, styles.headerText]}>JS</Text>
          <Text style={[styles.cell, styles.headerText]}>
            {NATIVE_LANGUAGE}
          </Text>
        </View>
        {Object.entries(SAMPLE).map(([key, value]) => (
          <View key={key} style={styles.tableRow}>
            <Text style={styles.cell}>
              <Text style={styles.key}>{key}</Text>: {jsType(value)}
            </Text>
            <Text style={styles.cell}>
              {native ? (native[key] ?? '—') : '…'}
            </Text>
          </View>
        ))}
      </View>
      <Note>{t('types.note')}</Note>
    </DemoCard>
  );
}

// =====================================================================
// 6. Errors
// =====================================================================

export function ErrorsDemo() {
  const bridge = getBridge();
  const { t } = useTranslation('bridging');
  const [result, setResult] = useState('');

  const run = async () => {
    if (!bridge) {
      return;
    }
    try {
      await bridge.fail('E_DEMO', 'Something went wrong in native code');
    } catch (error) {
      const { code, message } = error as { code?: string; message?: string };
      setResult(
        `catch → error instanceof Error: ${error instanceof Error}\n` +
          `error.code: "${code}"\nerror.message: "${message}"`,
      );
      log.warn('Native rejected as expected', { code });
    }
  };

  return (
    <DemoCard
      title={t('errors.title')}
      api="promise.reject('E_DEMO', 'Something went wrong')"
      description={t('errors.description')}
    >
      {bridge ? (
        <Button label={t('buttons.fail')} variant="danger" onPress={run} />
      ) : (
        <Missing />
      )}
      <Result>{result}</Result>
    </DemoCard>
  );
}

// =====================================================================
// 7. Cost of crossing
// =====================================================================

const CALLS = 1000;

export function BenchmarkDemo() {
  const bridge = getBridge();
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const mounted = useRef(true);
  const styles = useStyles();
  const { t } = useTranslation('bridging');

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const run = () => {
    if (!bridge || running) {
      return;
    }
    setRunning(true);
    // Let React show "Running…" before the sync loop blocks the JS thread.
    setTimeout(async () => {
      const measured = await runBridgeBenchmark(bridge, CALLS);
      log.info('Bridge benchmark', {
        results: measured.map(r => `${r.name}: ${r.perCallUs.toFixed(2)} µs`),
      });
      if (mounted.current) {
        setResults(measured);
        setRunning(false);
      }
    }, 50);
  };

  const slowest = results ? Math.max(...results.map(r => r.perCallUs)) : 1;

  return (
    <DemoCard
      title={t('benchmark.title')}
      api={`${CALLS} × add(a, b): JS vs sync native vs async native`}
      description={t('benchmark.description')}
    >
      {bridge ? (
        <Button
          label={
            running
              ? t('benchmark.running')
              : t('benchmark.run', { calls: CALLS })
          }
          onPress={run}
        />
      ) : (
        <Missing />
      )}
      {results?.map(r => (
        <View key={r.name} style={styles.bar}>
          <Text style={styles.barLabel}>
            {t('benchmark.bar', {
              name: t(`benchmark.names.${r.id}`),
              perCall: r.perCallUs.toFixed(2),
              total: ms(r.totalMs),
            })}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.max((r.perCallUs / slowest) * 100, 1)}%` },
              ]}
            />
          </View>
        </View>
      ))}
      <Note>{t('benchmark.note')}</Note>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  tick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tickCount: {
    minWidth: 48,
    fontSize: 32,
    fontWeight: '800',
    color: c.primary,
    textAlign: 'center',
  },
  tickInfo: {
    flex: 1,
    fontSize: 12,
    color: c.text,
  },
  table: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.borderStrong,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
  },
  tableHeader: {
    borderTopWidth: 0,
    backgroundColor: c.surfaceAlt,
  },
  cell: {
    flex: 1,
    padding: 6,
    fontSize: 11,
    color: c.text,
  },
  headerText: {
    fontWeight: '700',
    color: c.primary,
  },
  key: {
    fontWeight: '700',
  },
  bar: {
    gap: 4,
  },
  barLabel: {
    fontSize: 12,
    color: c.text,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: c.surfaceMuted,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: c.primary,
  },
}));
