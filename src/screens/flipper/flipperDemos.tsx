import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { createLogger } from '../../observability/logger';
import { makeStyles, useTheme } from '../../theme';
import { breakingBadApi } from '../breakingBad/breakingBadApi';
import {
  Button,
  DemoCard,
  Note,
  Replacement,
  Result,
  Row,
  Steps,
} from './flipperUi';

const log = createLogger('DevToolsDemo');

// ---------- Logs → Console ----------

/** Flipper's Logs plugin → React Native DevTools Console. */
export function ConsoleDemo() {
  const { t } = useTranslation('flipper');
  const [last, setLast] = useState('');

  const actions: { label: string; run: () => void }[] = [
    { label: 'console.log', run: () => console.log('Hello from the app 👋') },
    {
      label: t('console.buttons.object'),
      run: () =>
        console.log('A nested object (expand it in DevTools):', {
          user: { id: 42, name: 'Pablo', roles: ['admin', 'dev'] },
          createdAt: new Date(),
        }),
    },
    {
      label: 'console.table',
      run: () =>
        console.table([
          { screen: 'Home', visits: 12 },
          { screen: 'Pokemon', visits: 7 },
          { screen: 'Vault', visits: 3 },
        ]),
    },
    {
      label: 'console.group',
      run: () => {
        console.group('Checkout');
        console.log('validate cart');
        console.log('charge card');
        console.groupEnd();
      },
    },
    { label: 'console.warn', run: () => console.warn('Something looks odd') },
    {
      label: 'console.error',
      run: () => console.error(new Error('Something failed (test)')),
    },
    {
      label: t('console.buttons.logger'),
      run: () => log.info('Structured log line', { from: 'DevTools demo' }),
    },
  ];

  return (
    <DemoCard
      title={t('console.title')}
      api="console.log · table · group · warn · error"
      description={t('console.description')}
    >
      <Replacement
        flipper={t('console.replacement.flipper')}
        today={t('console.replacement.today')}
      />
      <Row>
        {actions.map(a => (
          <Button
            key={a.label}
            label={a.label}
            variant="secondary"
            onPress={() => {
              a.run();
              setLast(t('console.sent', { label: a.label }));
            }}
          />
        ))}
      </Row>
      <Result>{last}</Result>
      <Note>{t('console.note')}</Note>
    </DemoCard>
  );
}

// ---------- Network → Network panel ----------

const POKEAPI = 'https://pokeapi.co/api/v2';

/** Flipper's Network plugin → DevTools Network panel. */
export function NetworkDemo() {
  const { t } = useTranslation('flipper');
  const [result, setResult] = useState('');

  const request = async (label: string, run: () => Promise<string>) => {
    setResult(`${label}…`);
    const start = Date.now();
    try {
      const summary = await run();
      setResult(`${label}: ${summary} (${Date.now() - start} ms)`);
    } catch (error) {
      log.warn('Network demo request failed', { label }, error);
      setResult(`${label}: ${String(error)}`);
    }
  };

  return (
    <DemoCard
      title={t('network.title')}
      api="fetch / XMLHttpRequest / axios"
      description={t('network.description')}
    >
      <Replacement
        flipper={t('network.replacement.flipper')}
        today={t('network.replacement.today')}
      />
      <Row>
        <Button
          label="GET (fetch)"
          onPress={() =>
            request('GET /pokemon/pikachu', async () => {
              const r = await fetch(`${POKEAPI}/pokemon/pikachu`);
              const json = await r.json();
              return t('network.results.weighs', {
                status: r.status,
                name: json.name,
                weight: json.weight,
              });
            })
          }
        />
        <Button
          label="POST (fetch)"
          onPress={() =>
            request('POST /posts', async () => {
              const r = await fetch(
                'https://jsonplaceholder.typicode.com/posts',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: 'Hello',
                    body: 'From RN',
                    userId: 1,
                  }),
                },
              );
              const json = await r.json();
              return t('network.results.created', {
                status: r.status,
                id: json.id,
              });
            })
          }
        />
        <Button
          label="404"
          variant="secondary"
          onPress={() =>
            request('GET /pokemon/not-a-pokemon', async () => {
              const r = await fetch(`${POKEAPI}/pokemon/not-a-pokemon`);
              return `${r.status} ${r.ok ? 'OK' : t('network.results.failed')}`;
            })
          }
        />
        <Button
          label="axios"
          variant="secondary"
          onPress={() =>
            request('axios GET /characters', async () => {
              const r = await breakingBadApi.get('/characters', {
                params: { category: 'Breaking Bad' },
              });
              return t('network.results.characters', {
                status: r.status,
                total: r.data.length,
              });
            })
          }
        />
      </Row>
      <Result>{result}</Result>
      <Steps
        steps={[
          t('network.steps.open'),
          t('network.steps.tab'),
          t('network.steps.click'),
        ]}
      />
    </DemoCard>
  );
}

// ---------- Layout inspector / React DevTools → Components ----------

function InspectMe({ title, color }: { title: string; color: string }) {
  const styles = useStyles();
  const { t } = useTranslation('flipper');
  const [count, setCount] = useState(0);
  return (
    <View style={[styles.inspect, { borderColor: color }]} testID="inspect-me">
      <Text style={styles.inspectTitle}>{title}</Text>
      <Text style={styles.inspectText}>
        {t('components.countState', { value: count })}
      </Text>
      <Button label="count + 1" onPress={() => setCount(c => c + 1)} />
    </View>
  );
}

/** Flipper's Layout inspector + React DevTools → Components tab. */
export function ComponentsDemo() {
  const { t } = useTranslation('flipper');
  const { colors } = useTheme();
  return (
    <DemoCard
      title={t('components.title')}
      api="<InspectMe title='…' color='…' />"
      description={t('components.description')}
    >
      <Replacement
        flipper={t('components.replacement.flipper')}
        today={t('components.replacement.today')}
      />
      <InspectMe title={t('components.inspectMe')} color={colors.primary} />
      <Steps
        steps={[
          t('components.steps.search'),
          t('components.steps.select'),
          t('components.steps.device'),
          t('components.steps.native'),
        ]}
      />
    </DemoCard>
  );
}

// ---------- Profiler ----------

function SlowRow({ index }: { index: number }) {
  const styles = useStyles();
  const { t } = useTranslation('flipper');
  // Deliberately wasteful work so renders show up in the profiler.
  let x = 0;
  for (let i = 0; i < 20000; i++) {
    x += Math.sqrt(i * index);
  }
  return (
    <Text style={styles.row}>
      {t('profiler.row', { number: index + 1, value: x.toFixed(0) })}
    </Text>
  );
}

/** Flipper's React DevTools profiler → DevTools Profiler tab. */
export function ProfilerDemo() {
  const styles = useStyles();
  const { t } = useTranslation('flipper');
  const [rows, setRows] = useState(0);
  const [tick, setTick] = useState(0);

  return (
    <DemoCard
      title={t('profiler.title')}
      api="React DevTools → Profiler (record → render → stop)"
      description={t('profiler.description')}
    >
      <Replacement
        flipper={t('profiler.replacement.flipper')}
        today={t('profiler.replacement.today')}
      />
      <Row>
        <Button
          label={t('profiler.buttons.render')}
          onPress={() => setRows(60)}
        />
        <Button
          label={t('profiler.buttons.rerender')}
          variant="secondary"
          onPress={() => setTick(n => n + 1)}
        />
        <Button
          label={t('profiler.buttons.clear')}
          variant="secondary"
          onPress={() => setRows(0)}
        />
      </Row>
      <FlatList
        data={Array.from({ length: rows }, (_, i) => i)}
        keyExtractor={i => `${i}-${tick}`}
        renderItem={({ item }) => <SlowRow index={item} />}
        style={styles.list}
        nestedScrollEnabled
      />
      <Steps
        steps={[
          t('profiler.steps.record'),
          t('profiler.steps.press'),
          t('profiler.steps.flame'),
        ]}
      />
    </DemoCard>
  );
}

// ---------- Performance → Performance panel ----------

type PerformanceLike = {
  now(): number;
  mark?: (name: string) => void;
  measure?: (name: string, start?: string, end?: string) => void;
};

const perf = (globalThis as unknown as { performance: PerformanceLike })
  .performance;

/** Flipper's performance plugins → DevTools Performance panel. */
export function PerformanceDemo() {
  const { t } = useTranslation('flipper');
  const [result, setResult] = useState('');

  const heavyWork = () => {
    perf.mark?.('heavy-start');
    const start = perf.now();
    let sum = 0;
    for (let i = 0; i < 3_000_000; i++) {
      sum += Math.sin(i);
    }
    perf.mark?.('heavy-end');
    // User Timings appear as labelled blocks in the Performance timeline.
    perf.measure?.('Heavy work (demo)', 'heavy-start', 'heavy-end');
    setResult(
      t('performance.result', {
        ms: (perf.now() - start).toFixed(0),
        sum: sum.toFixed(2),
      }),
    );
  };

  return (
    <DemoCard
      title={t('performance.title')}
      api="performance.mark('a') · performance.measure('label', 'a', 'b')"
      description={t('performance.description')}
    >
      <Replacement
        flipper={t('performance.replacement.flipper')}
        today={t('performance.replacement.today')}
      />
      <Button label={t('performance.button')} onPress={heavyWork} />
      <Result>{result}</Result>
      <Steps
        steps={[
          t('performance.steps.record'),
          t('performance.steps.press'),
          t('performance.steps.find'),
          t('performance.steps.fps'),
        ]}
      />
    </DemoCard>
  );
}

// ---------- Hermes debugger → Sources ----------

/** Put a breakpoint inside this function in DevTools → Sources. */
function calculateCartTotal(
  items: { name: string; price: number; qty: number }[],
) {
  let total = 0;
  for (const item of items) {
    const line = item.price * item.qty; // ← set a breakpoint here
    total += line;
  }
  return Math.round(total * 1.16 * 100) / 100; // with 16% tax
}

/** Flipper's Hermes debugger → DevTools Sources. */
export function DebuggerDemo() {
  const { t } = useTranslation('flipper');
  const [total, setTotal] = useState<number | null>(null);
  return (
    <DemoCard
      title={t('debugger.title')}
      api="DevTools → Sources → flipperDemos.tsx → calculateCartTotal"
      description={t('debugger.description')}
    >
      <Replacement
        flipper={t('debugger.replacement.flipper')}
        today={t('debugger.replacement.today')}
      />
      <Button
        label="calculateCartTotal()"
        onPress={() =>
          setTotal(
            calculateCartTotal([
              { name: 'Keyboard', price: 799, qty: 1 },
              { name: 'Mouse', price: 349.5, qty: 2 },
            ]),
          )
        }
      />
      <Result>{total !== null ? t('debugger.total', { total }) : ''}</Result>
      <Steps
        steps={[
          t('debugger.steps.open'),
          t('debugger.steps.click'),
          t('debugger.steps.press'),
        ]}
      />
    </DemoCard>
  );
}

// ---------- Databases / Shared Preferences → in-app viewer ----------

/** Flipper's AsyncStorage / Shared Preferences / Databases plugins. */
export function StorageDemo() {
  const styles = useStyles();
  const { t } = useTranslation('flipper');
  const [entries, setEntries] = useState<[string, string | null][] | null>(
    null,
  );

  const load = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const values = await AsyncStorage.getMany(keys);
    const list: [string, string | null][] = Object.entries(values);
    setEntries(list);
    // Also as a table in the DevTools Console.
    console.table(
      list.map(([key, value]) => ({
        key,
        bytes: value?.length ?? 0,
        preview: value?.slice(0, 60),
      })),
    );
  };

  return (
    <DemoCard
      title={t('storage.title')}
      api="AsyncStorage.getAllKeys() + getMany(keys)"
      description={t('storage.description')}
    >
      <Replacement
        flipper={t('storage.replacement.flipper')}
        today={t('storage.replacement.today')}
      />
      <Row>
        <Button label={t('storage.buttons.read')} onPress={load} />
        <Button
          label={t('storage.buttons.write')}
          variant="secondary"
          onPress={async () => {
            await AsyncStorage.setItem(
              '@ReactNativeExamples/devtoolsDemo',
              JSON.stringify({ savedAt: new Date().toISOString() }),
            );
            await load();
          }}
        />
      </Row>
      {entries ? (
        <View style={styles.table}>
          {entries.length === 0 ? (
            <Text style={styles.cell}>{t('storage.empty')}</Text>
          ) : (
            entries.map(([key, value]) => (
              <View key={key} style={styles.tableRow}>
                <Text style={[styles.cell, styles.key]}>{key}</Text>
                <Text style={styles.cell} numberOfLines={2}>
                  {value}
                </Text>
              </View>
            ))
          )}
        </View>
      ) : null}
      <Note>{t('storage.note')}</Note>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  inspect: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  inspectTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: c.text,
  },
  inspectText: {
    color: c.text,
  },
  list: {
    maxHeight: 180,
  },
  row: {
    paddingVertical: 4,
    fontSize: 12,
    color: c.text,
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
  cell: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: c.text,
  },
  key: {
    fontWeight: '700',
    color: c.primary,
  },
}));
