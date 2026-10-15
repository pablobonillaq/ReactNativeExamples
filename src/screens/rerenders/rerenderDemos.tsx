import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { createLogger } from '../../observability/logger';
import { makeStyles, useTheme } from '../../theme';
import { Button, Chips, DemoCard, Note, Row } from '../animated/ui';
import { Comparison, RenderBadge } from './renderTracking';

const log = createLogger('Rerenders');

// =====================================================================
// React.memo
// =====================================================================

function PlainChild({ name }: { name: string }) {
  const { t } = useTranslation('rerenders');
  return (
    <RenderBadge id="memo/plain-child" label={t('labels.child', { name })} />
  );
}

/** Same component wrapped in memo: skips rendering if its props are equal. */
function MemoChildView({ name }: { name: string }) {
  const { t } = useTranslation('rerenders');
  return (
    <RenderBadge id="memo/memo-child" label={t('labels.child', { name })} />
  );
}
const MemoChild = memo(MemoChildView);

export function ReactMemoDemo() {
  const [tick, setTick] = useState(0);
  const [name, setName] = useState('Ana');
  const { t } = useTranslation('rerenders');

  return (
    <DemoCard
      title="React.memo"
      api="function ChildView(props) { … }  const Child = memo(ChildView)"
      description={t('memo.description')}
    >
      <Comparison
        withLabel={t('memo.withLabel')}
        without={
          <>
            <RenderBadge
              id="memo/parent-a"
              label={t('labels.parentTick', { tick })}
            />
            <PlainChild name={name} />
          </>
        }
        withIt={
          <>
            <RenderBadge
              id="memo/parent-b"
              label={t('labels.parentTick', { tick })}
            />
            <MemoChild name={name} />
          </>
        }
      />
      <Row>
        <Button
          label={t('memo.rerenderParent')}
          onPress={() => setTick(n => n + 1)}
        />
        <Button
          label={t('memo.changeProp')}
          variant="secondary"
          onPress={() => setName(n => (n === 'Ana' ? 'Luis' : 'Ana'))}
        />
      </Row>
      <Note>{t('memo.note')}</Note>
    </DemoCard>
  );
}

// =====================================================================
// useCallback
// =====================================================================

function LikeButtonView({ id, onLike }: { id: string; onLike: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation('rerenders');
  return (
    <View style={styles.stack}>
      <RenderBadge id={id} label="memo(LikeButton)" />
      <Pressable
        onPress={onLike}
        style={styles.like}
        accessibilityRole="button"
      >
        <Text style={styles.likeText}>{t('callback.like')}</Text>
      </Pressable>
    </View>
  );
}
const LikeButton = memo(LikeButtonView);

function WithoutUseCallback() {
  const [likes, setLikes] = useState(0);
  // A brand-new function on every render → memo sees a "changed" prop.
  const onLike = () => setLikes(l => l + 1);
  const { t } = useTranslation('rerenders');
  return (
    <>
      <RenderBadge
        id="cb/parent-a"
        label={t('labels.parentLikes', { likes })}
      />
      <LikeButton id="cb/child-a" onLike={onLike} />
    </>
  );
}

function WithUseCallback() {
  const [likes, setLikes] = useState(0);
  // The same function between renders (no dependencies change).
  const onLike = useCallback(() => setLikes(l => l + 1), []);
  const { t } = useTranslation('rerenders');
  return (
    <>
      <RenderBadge
        id="cb/parent-b"
        label={t('labels.parentLikes', { likes })}
      />
      <LikeButton id="cb/child-b" onLike={onLike} />
    </>
  );
}

export function UseCallbackDemo() {
  const [tick, setTick] = useState(0);
  const { t } = useTranslation('rerenders');
  return (
    <DemoCard
      title="useCallback"
      api="const onLike = useCallback(() => setLikes(l => l + 1), [])"
      description={t('callback.description')}
    >
      <Comparison
        withLabel={t('callback.withLabel')}
        without={<WithoutUseCallback />}
        withIt={<WithUseCallback />}
      />
      <Button
        label={t('callback.rerenderParents', { tick })}
        onPress={() => setTick(n => n + 1)}
      />
      <Note>{t('callback.note')}</Note>
    </DemoCard>
  );
}

// =====================================================================
// useMemo: expensive calculations
// =====================================================================

const FIRST = [
  'Ana',
  'Luis',
  'Sofía',
  'Diego',
  'Elena',
  'Mateo',
  'Valeria',
  'Iker',
];
const LAST = ['García', 'López', 'Martínez', 'Hernández', 'Pérez', 'Ruiz'];
const PEOPLE = Array.from(
  { length: 40_000 },
  (_, i) => `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]} #${i}`,
);

const computeStats = new Map<string, { runs: number; ms: number }>();

/** Deliberately slow: filters and sorts 40,000 strings. */
function filterPeople(query: string, statsKey: string) {
  const start = Date.now();
  const result = PEOPLE.filter(p =>
    p.toLowerCase().includes(query.toLowerCase()),
  ).sort((a, b) => a.localeCompare(b));
  const previous = computeStats.get(statsKey) ?? { runs: 0, ms: 0 };
  computeStats.set(statsKey, {
    runs: previous.runs + 1,
    ms: Date.now() - start,
  });
  return result;
}

function ComputeInfo({ statsKey, count }: { statsKey: string; count: number }) {
  const styles = useStyles();
  const { t } = useTranslation('rerenders');
  const stats = computeStats.get(statsKey);
  return (
    <Text style={styles.info}>
      {t('calculation.info', {
        matches: count,
        runs: stats?.runs ?? 0,
        ms: stats?.ms ?? 0,
      })}
    </Text>
  );
}

function WithoutUseMemo({ query, dark }: { query: string; dark: boolean }) {
  // Recalculated on every render, even when only `dark` changed.
  const people = filterPeople(query, 'no-memo');
  const { t } = useTranslation('rerenders');
  return (
    <>
      <RenderBadge
        id="memo-calc/a"
        label={dark ? t('labels.parentDark') : t('labels.parent')}
      />
      <ComputeInfo statsKey="no-memo" count={people.length} />
    </>
  );
}

function WithUseMemo({ query, dark }: { query: string; dark: boolean }) {
  // Recalculated only when `query` changes.
  const people = useMemo(() => filterPeople(query, 'memo'), [query]);
  const { t } = useTranslation('rerenders');
  return (
    <>
      <RenderBadge
        id="memo-calc/b"
        label={dark ? t('labels.parentDark') : t('labels.parent')}
      />
      <ComputeInfo statsKey="memo" count={people.length} />
    </>
  );
}

export function UseMemoCalculationDemo() {
  const [query, setQuery] = useState<'ana' | 'pérez' | '#1'>('ana');
  const [dark, setDark] = useState(false);
  const { t } = useTranslation('rerenders');

  return (
    <DemoCard
      title={t('calculation.title')}
      api="const people = useMemo(() => filter(all, query), [query])"
      description={t('calculation.description')}
    >
      <Comparison
        withLabel={t('calculation.withLabel')}
        without={<WithoutUseMemo query={query} dark={dark} />}
        withIt={<WithUseMemo query={query} dark={dark} />}
      />
      <Chips
        options={['ana', 'pérez', '#1'] as const}
        value={query}
        onChange={q => {
          log.debug('Filter changed', { q });
          setQuery(q);
        }}
      />
      <Button
        label={t('calculation.toggleTheme')}
        onPress={() => setDark(d => !d)}
      />
      <Note>{t('calculation.note')}</Note>
    </DemoCard>
  );
}

// =====================================================================
// useMemo: stable objects for memo children
// =====================================================================

type ChartOptions = { color: string; showGrid: boolean };

function ChartView({ id, options }: { id: string; options: ChartOptions }) {
  const styles = useStyles();
  return (
    <View style={[styles.chart, { borderColor: options.color }]}>
      <RenderBadge id={id} label="memo(Chart)" />
    </View>
  );
}
const Chart = memo(ChartView);

function WithoutStableObject({ tick, color }: { tick: number; color: string }) {
  // A new object on every render, even with the same contents.
  const options = { color, showGrid: true };
  const { t } = useTranslation('rerenders');
  return (
    <>
      <RenderBadge
        id="memo-obj/parent-a"
        label={t('labels.parentTick', { tick })}
      />
      <Chart id="memo-obj/chart-a" options={options} />
    </>
  );
}

function WithStableObject({ tick, color }: { tick: number; color: string }) {
  // Same object until `color` changes.
  const options = useMemo(() => ({ color, showGrid: true }), [color]);
  const { t } = useTranslation('rerenders');
  return (
    <>
      <RenderBadge
        id="memo-obj/parent-b"
        label={t('labels.parentTick', { tick })}
      />
      <Chart id="memo-obj/chart-b" options={options} />
    </>
  );
}

export function UseMemoObjectDemo() {
  const [tick, setTick] = useState(0);
  // The chart's border color, as a theme token so it follows light / dark.
  const [colorKey, setColorKey] = useState<'primary' | 'pink'>('primary');
  const color = useTheme().colors[colorKey];
  const { t } = useTranslation('rerenders');
  return (
    <DemoCard
      title={t('objects.title')}
      api="const options = useMemo(() => ({ color, showGrid: true }), [color])"
      description={t('objects.description')}
    >
      <Comparison
        withLabel={t('objects.withLabel')}
        without={<WithoutStableObject tick={tick} color={color} />}
        withIt={<WithStableObject tick={tick} color={color} />}
      />
      <Row>
        <Button
          label={t('objects.rerenderParents')}
          onPress={() => setTick(n => n + 1)}
        />
        <Button
          label={t('objects.changeColor')}
          variant="secondary"
          onPress={() =>
            setColorKey(k => (k === 'primary' ? 'pink' : 'primary'))
          }
        />
      </Row>
      <Note>
        {/* The code parts go in as values: {{ }} in a text would be read as
            an i18next variable. */}
        {t('objects.note', {
          style: 'style={{ … }}',
          data: 'data={[ … ]}',
        })}
      </Note>
    </DemoCard>
  );
}

// =====================================================================
// useRef
// =====================================================================

function StateTapCounter() {
  // Stored in state although nothing on screen shows it → useless renders.
  const [taps, setTaps] = useState(0);
  const { t } = useTranslation('rerenders');
  return (
    <>
      <RenderBadge id="ref-taps/a" label={t('labels.tapCounter')} />
      <Button
        label={t('refCounter.tap')}
        onPress={() => {
          setTaps(taps + 1);
          log.debug('Tap (state)', { taps: taps + 1 });
        }}
      />
    </>
  );
}

function RefTapCounter() {
  // A ref keeps the value between renders without causing any.
  const taps = useRef(0);
  const [shown, setShown] = useState<number | null>(null);
  const styles = useStyles();
  const { t } = useTranslation('rerenders');
  return (
    <>
      <RenderBadge id="ref-taps/b" label={t('labels.tapCounter')} />
      <Button
        label={t('refCounter.tap')}
        onPress={() => {
          taps.current += 1;
          log.debug('Tap (ref)', { taps: taps.current });
        }}
      />
      <Pressable onPress={() => setShown(taps.current)}>
        <Text style={styles.link}>
          {shown === null
            ? t('refCounter.showCount')
            : t('refCounter.count', { shown })}
        </Text>
      </Pressable>
    </>
  );
}

export function UseRefCounterDemo() {
  const { t } = useTranslation('rerenders');
  return (
    <DemoCard
      title={t('refCounter.title')}
      api="const taps = useRef(0); taps.current += 1"
      description={t('refCounter.description')}
    >
      <Comparison
        withLabel={t('refCounter.withLabel')}
        without={<StateTapCounter />}
        withIt={<RefTapCounter />}
      />
      <Note>{t('refCounter.note')}</Note>
    </DemoCard>
  );
}

function ControlledInput() {
  const [text, setText] = useState('');
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation('rerenders');
  return (
    <>
      <RenderBadge id="ref-input/a" label={t('labels.form')} />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t('refInput.placeholder')}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
      />
    </>
  );
}

function UncontrolledInput() {
  const text = useRef('');
  const inputRef = useRef<TextInputInstance>(null);
  const [sent, setSent] = useState('');
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation('rerenders');
  return (
    <>
      <RenderBadge id="ref-input/b" label={t('labels.form')} />
      <TextInput
        ref={inputRef}
        defaultValue=""
        onChangeText={value => {
          text.current = value;
        }}
        placeholder={t('refInput.placeholder')}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
      />
      <Pressable
        onPress={() => {
          setSent(text.current);
          inputRef.current?.clear();
          text.current = '';
        }}
      >
        <Text style={styles.link}>
          {sent ? t('refInput.sent', { sent }) : t('refInput.send')}
        </Text>
      </Pressable>
    </>
  );
}

export function UseRefInputDemo() {
  const { t } = useTranslation('rerenders');
  return (
    <DemoCard
      title={t('refInput.title')}
      api="<TextInput defaultValue='' onChangeText={v => (text.current = v)} />"
      description={t('refInput.description')}
    >
      <Comparison
        withLabel={t('refInput.withLabel')}
        without={<ControlledInput />}
        withIt={<UncontrolledInput />}
      />
      <Note>{t('refInput.note')}</Note>
    </DemoCard>
  );
}

const useStyles = makeStyles(c => ({
  stack: {
    gap: 4,
  },
  like: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: c.primarySoft,
  },
  likeText: {
    color: c.primary,
    fontWeight: '600',
  },
  info: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: c.text,
  },
  chart: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 4,
  },
  link: {
    fontSize: 13,
    color: c.primary,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: c.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: c.surface,
    color: c.text,
  },
}));
