import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import i18n from '../../i18n';
import { createLogger } from '../../observability/logger';
import { makeStyles } from '../../theme';
import {
  Button,
  DemoCard,
  Note,
  Result,
  Row,
  Steps,
} from '../flipper/flipperUi';
import {
  checkFeatures,
  getGc,
  getHeapStats,
  getRuntimeProperties,
  isHermes,
  now,
  runBenchmarks,
  type BenchmarkResult,
  type HeapStats,
} from './hermesRuntime';

const log = createLogger('Hermes');

function KeyValueTable({ rows }: { rows: [string, string][] }) {
  const styles = useStyles();
  return (
    <View style={styles.table}>
      {rows.map(([key, value]) => (
        <View key={key} style={styles.tableRow}>
          <Text style={styles.key}>{key}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------- Engine info ----------

/** Is Hermes running, and which version? */
export function EngineInfoDemo() {
  const styles = useStyles();
  const { t } = useTranslation('hermes');
  const hermes = isHermes();
  const props = getRuntimeProperties();

  return (
    <DemoCard
      title={t('engine.title')}
      api="global.HermesInternal?.getRuntimeProperties()"
      description={t('engine.description')}
    >
      <Text style={[styles.badge, hermes ? styles.ok : styles.no]}>
        {hermes ? t('engine.hermes') : t('engine.notHermes')}
      </Text>
      {props ? (
        <KeyValueTable rows={Object.entries(props)} />
      ) : (
        <Note>{t('engine.noProperties')}</Note>
      )}
      <Note>{t('engine.note')}</Note>
    </DemoCard>
  );
}

// ---------- Bytecode ----------

function add(a: number, b: number) {
  return a + b;
}

/** Hermes compiles JS to bytecode ahead of time. */
export function BytecodeDemo() {
  const { t } = useTranslation('hermes');
  const [source, setSource] = useState('');

  return (
    <DemoCard
      title={t('bytecode.title')}
      api="add.toString()"
      description={t('bytecode.description')}
    >
      <Steps
        steps={[
          t('bytecode.steps.debug'),
          t('bytecode.steps.release'),
          t('bytecode.steps.launch'),
        ]}
      />
      <Button
        label="add.toString()"
        onPress={() => setSource(add.toString())}
      />
      <Result>{source}</Result>
      <Note>{t('bytecode.note')}</Note>
    </DemoCard>
  );
}

// ---------- Memory / GC ----------

/** Heap size and garbage collections, live. */
export function MemoryDemo() {
  const { t } = useTranslation('hermes');
  const [stats, setStats] = useState<HeapStats | null>(() => getHeapStats());
  const retained = useRef<unknown[]>([]);
  const gc = getGc();

  useEffect(() => {
    const id = setInterval(() => setStats(getHeapStats()), 1000);
    return () => clearInterval(id);
  }, []);

  const allocate = () => {
    // ~200,000 small objects that stay referenced (can't be collected).
    const chunk = Array.from({ length: 200_000 }, (_, i) => ({
      id: i,
      label: `object ${i}`,
    }));
    retained.current.push(chunk);
    log.info('Allocated objects', { chunks: retained.current.length });
    setStats(getHeapStats());
  };

  const release = () => {
    // Dropping the references makes them garbage; the GC frees them later.
    retained.current = [];
    log.info('Released objects');
    setStats(getHeapStats());
  };

  return (
    <DemoCard
      title={t('memory.title')}
      api="HermesInternal.getInstrumentedStats()"
      description={t('memory.description')}
    >
      {stats ? (
        <KeyValueTable
          rows={[
            [t('memory.heapSize'), `${stats.heapSizeMB.toFixed(1)} MB`],
            [t('memory.allocated'), `${stats.allocatedMB.toFixed(1)} MB`],
            [t('memory.collections'), String(stats.numGCs)],
            [t('memory.gcTime'), `${stats.gcTimeMs.toFixed(0)} ms`],
          ]}
        />
      ) : (
        <Note>{t('memory.onlyHermes')}</Note>
      )}
      <Row>
        <Button label={t('memory.allocate')} onPress={allocate} />
        <Button
          label={t('memory.release')}
          variant="secondary"
          onPress={release}
        />
        {gc ? (
          <Button
            label="gc()"
            variant="secondary"
            onPress={() => {
              gc();
              setStats(getHeapStats());
            }}
          />
        ) : null}
      </Row>
      <Note>{t('memory.note')}</Note>
    </DemoCard>
  );
}

// ---------- Event loop ----------

// queueMicrotask isn't in React Native's TypeScript globals.
function queueMicrotaskSafe(callback: () => void) {
  const queue = (
    globalThis as unknown as { queueMicrotask?: (cb: () => void) => void }
  ).queueMicrotask;
  if (queue) {
    queue(callback);
  } else {
    Promise.resolve().then(callback);
  }
}

/** Sync code, microtasks (promises) and macrotasks (timers) run in order. */
export function EventLoopDemo() {
  const styles = useStyles();
  const { t } = useTranslation('hermes');
  const [order, setOrder] = useState<string[]>([]);

  const run = () => {
    const steps: string[] = [];
    const push = (step: string) => {
      steps.push(step);
      setOrder([...steps]);
    };
    push(t('eventLoop.order.syncStart'));
    setTimeout(() => push(t('eventLoop.order.timeout')), 0);
    Promise.resolve().then(() => push(t('eventLoop.order.promise')));
    queueMicrotaskSafe(() => push(t('eventLoop.order.microtask')));
    push(t('eventLoop.order.syncEnd'));
  };

  return (
    <DemoCard
      title={t('eventLoop.title')}
      api="Promise.then · queueMicrotask · setTimeout(fn, 0)"
      description={t('eventLoop.description')}
    >
      <Button label={t('eventLoop.run')} onPress={run} />
      {order.length > 0 ? (
        <View style={styles.order}>
          {order.map(step => (
            <Text key={step} style={styles.value}>
              {step}
            </Text>
          ))}
        </View>
      ) : null}
    </DemoCard>
  );
}

// ---------- Features ----------

/** Which modern built-ins this Hermes build provides. */
export function FeaturesDemo() {
  const styles = useStyles();
  const { t } = useTranslation('hermes');
  const [features] = useState(checkFeatures);
  const supported = features.filter(f => f.supported).length;

  return (
    <DemoCard
      title={t('features.title')}
      api="typeof Array.prototype.at === 'function'"
      description={t('features.description')}
    >
      <Text style={styles.summary}>
        {t('features.summary', { supported, total: features.length })}
      </Text>
      <View style={styles.features}>
        {features.map(f => (
          // Feature names are API names: shown as-is.
          <Text key={f.name} style={styles.feature}>
            {f.supported ? '✅' : '❌'} {f.name}
          </Text>
        ))}
      </View>
    </DemoCard>
  );
}

// ---------- Intl ----------

// Options from ES2020/2021 Intl (dateStyle, notation…) aren't in the
// TypeScript `lib` React Native uses, so they're typed loosely here.
const dateOptions = { dateStyle: 'full', timeStyle: 'short' } as Record<
  string,
  unknown
> as Intl.DateTimeFormatOptions;
const compactOptions = { notation: 'compact' } as Record<
  string,
  unknown
> as Intl.NumberFormatOptions;

function intlSamples(): [string, string][] {
  const date = new Date(2026, 9, 5, 18, 30);
  const samples: [string, () => string][] = [
    [
      'DateTimeFormat (es-MX, full)',
      () => new Intl.DateTimeFormat('es-MX', dateOptions).format(date),
    ],
    [
      'NumberFormat (MXN)',
      () =>
        new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
        }).format(1234567.891),
    ],
    [
      'NumberFormat (compact)',
      () => new Intl.NumberFormat('es-MX', compactOptions).format(2500000),
    ],
    [
      'PluralRules (en)',
      () =>
        [0, 1, 2]
          .map(n => `${n}: ${new Intl.PluralRules('en').select(n)}`)
          .join(', '),
    ],
    ['toLocaleString (de-DE)', () => (1234567.891).toLocaleString('de-DE')],
    [
      'Collator (es, ñ)',
      () =>
        ['zapato', 'ñandú', 'nube', 'árbol']
          .sort(new Intl.Collator('es').compare)
          .join(', '),
    ],
  ];
  return samples.map(([name, run]) => {
    try {
      return [name, run()];
    } catch (error) {
      return [
        name,
        i18n.t('hermes:intl.notSupported', { error: String(error) }),
      ];
    }
  });
}

/** Internationalization built into the engine. */
export function IntlDemo() {
  const { t } = useTranslation('hermes');
  const [rows] = useState(intlSamples);
  return (
    <DemoCard
      title={t('intl.title')}
      api="new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })"
      description={t('intl.description')}
    >
      <KeyValueTable rows={rows} />
    </DemoCard>
  );
}

// ---------- Benchmarks ----------

/** CPU-bound work timed on the JS thread. */
export function BenchmarkDemo() {
  const { t } = useTranslation('hermes');
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    // Let React paint "Running…" before blocking the JS thread.
    setTimeout(() => {
      const start = now();
      const r = runBenchmarks();
      log.info('Hermes benchmarks', {
        totalMs: Math.round(now() - start),
      });
      setResults(r);
      setRunning(false);
    }, 50);
  };

  return (
    <DemoCard
      title={t('benchmarks.title')}
      api="performance.now() around CPU-bound work"
      description={t('benchmarks.description')}
    >
      <Button
        label={running ? t('benchmarks.running') : t('benchmarks.run')}
        onPress={run}
      />
      {results ? (
        <KeyValueTable
          rows={results.map(r => [
            t(`benchmarks.names.${r.id}`, { defaultValue: r.name }),
            `${r.ms.toFixed(0)} ms · ${r.detail}`,
          ])}
        />
      ) : null}
      <Note>{t('benchmarks.note')}</Note>
    </DemoCard>
  );
}

// ---------- Debugging ----------

/** Hermes speaks the Chrome DevTools Protocol. */
export function DebuggingDemo() {
  const { t } = useTranslation('hermes');
  return (
    <DemoCard
      title={t('debugging.title')}
      api="Chrome DevTools Protocol (CDP)"
      description={t('debugging.description')}
    >
      <Steps
        steps={[
          t('debugging.steps.sources'),
          t('debugging.steps.performance'),
          t('debugging.steps.memory'),
          t('debugging.steps.crashes'),
        ]}
      />
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '700',
  },
  ok: {
    backgroundColor: c.successSoft,
    color: c.success,
  },
  no: {
    backgroundColor: c.dangerSoft,
    color: c.danger,
  },
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: c.codeBackground,
  },
  tableRow: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  key: {
    fontSize: 12,
    fontWeight: '700',
    color: c.primary,
  },
  value: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: c.text,
  },
  order: {
    gap: 4,
  },
  summary: {
    fontWeight: '700',
    color: c.text,
  },
  features: {
    gap: 2,
  },
  feature: {
    fontSize: 13,
    color: c.text,
  },
}));
