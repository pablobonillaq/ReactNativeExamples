/**
 * Small, typed helpers around the Hermes engine. Everything is optional:
 * on another engine (JSC, a Jest test) the helpers return null / false.
 */
import i18n from '../../i18n';

type HermesInternalType = {
  getRuntimeProperties?: () => Record<string, unknown>;
  getInstrumentedStats?: () => Record<string, number>;
};

type HermesGlobal = {
  HermesInternal?: HermesInternalType | null;
  gc?: () => void;
};

const g = globalThis as unknown as HermesGlobal;

/** True when the JS is running on Hermes. */
export function isHermes() {
  return g.HermesInternal != null;
}

/** Engine version, bytecode version, build… (Hermes only). */
export function getRuntimeProperties(): Record<string, string> | null {
  const props = g.HermesInternal?.getRuntimeProperties?.();
  if (!props) {
    return null;
  }
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(props)) {
    result[key] = String(value);
  }
  return result;
}

export type HeapStats = {
  heapSizeMB: number;
  allocatedMB: number;
  numGCs: number;
  gcTimeMs: number;
};

/** Garbage collector statistics (Hermes only). */
export function getHeapStats(): HeapStats | null {
  const stats = g.HermesInternal?.getInstrumentedStats?.();
  if (!stats) {
    return null;
  }
  const mb = (bytes: number | undefined) => (bytes ?? 0) / 1024 / 1024;
  return {
    heapSizeMB: mb(stats.js_heapSize),
    allocatedMB: mb(stats.js_allocatedBytes),
    numGCs: stats.js_numGCs ?? 0,
    // js_gcTime is reported in seconds.
    gcTimeMs: (stats.js_gcTime ?? 0) * 1000,
  };
}

/** Hermes exposes gc() in some builds; null when it isn't available. */
export function getGc() {
  return typeof g.gc === 'function' ? g.gc : null;
}

// ---------- Feature detection ----------

export type FeatureCheck = { name: string; supported: boolean };

/** True when `owner[key]` is a function (works for any built-in). */
function hasFunction(owner: unknown, key: string) {
  return (
    owner != null &&
    typeof (owner as Record<string, unknown>)[key] === 'function'
  );
}

/** True when a global with that name exists. */
function hasGlobal(name: string) {
  return (globalThis as unknown as Record<string, unknown>)[name] != null;
}

/**
 * Built-ins checked at runtime. (Syntax like ?. or async/await is compiled
 * by Babel / Hermes before running, so it can't be detected this way.)
 */
export function checkFeatures(): FeatureCheck[] {
  const intl = (globalThis as unknown as { Intl?: unknown }).Intl;
  return [
    { name: 'Promise (native)', supported: hasGlobal('Promise') },
    {
      name: 'Promise.allSettled / any',
      supported:
        hasFunction(Promise, 'allSettled') && hasFunction(Promise, 'any'),
    },
    { name: 'queueMicrotask', supported: hasGlobal('queueMicrotask') },
    {
      name: 'Proxy / Reflect',
      supported: hasGlobal('Proxy') && hasGlobal('Reflect'),
    },
    {
      name: 'Symbol.asyncIterator',
      supported: typeof Symbol.asyncIterator === 'symbol',
    },
    { name: 'BigInt', supported: hasGlobal('BigInt') },
    { name: 'WeakRef', supported: hasGlobal('WeakRef') },
    {
      name: 'FinalizationRegistry',
      supported: hasGlobal('FinalizationRegistry'),
    },
    {
      name: 'Intl (DateTimeFormat, NumberFormat)',
      supported:
        hasFunction(intl, 'DateTimeFormat') &&
        hasFunction(intl, 'NumberFormat'),
    },
    {
      name: 'Intl.RelativeTimeFormat',
      supported: hasFunction(intl, 'RelativeTimeFormat'),
    },
    {
      name: 'Array.prototype.at',
      supported: hasFunction(Array.prototype, 'at'),
    },
    {
      name: 'Array.prototype.findLast',
      supported: hasFunction(Array.prototype, 'findLast'),
    },
    {
      name: 'Array.prototype.toSorted',
      supported: hasFunction(Array.prototype, 'toSorted'),
    },
    { name: 'Object.hasOwn', supported: hasFunction(Object, 'hasOwn') },
    {
      name: 'String.prototype.replaceAll',
      supported: hasFunction(String.prototype, 'replaceAll'),
    },
    { name: 'structuredClone', supported: hasGlobal('structuredClone') },
    { name: 'TextEncoder', supported: hasGlobal('TextEncoder') },
    {
      name: 'SharedArrayBuffer / Atomics',
      supported: hasGlobal('SharedArrayBuffer') && hasGlobal('Atomics'),
    },
    { name: 'WebAssembly', supported: hasGlobal('WebAssembly') },
  ];
}

// ---------- Benchmarks ----------

/**
 * `name` is a stable English label (also used by tests); the UI shows the
 * translation of `hermes:benchmarks.names.<id>`. `detail` is translated when
 * the benchmark runs.
 */
export type BenchmarkResult = {
  id: string;
  name: string;
  ms: number;
  detail: string;
};

function fib(n: number): number {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

/** High-resolution clock (performance.now) with a Date fallback. */
export function now(): number {
  const perf = (globalThis as unknown as { performance?: { now(): number } })
    .performance;
  return perf ? perf.now() : Date.now();
}

function time(id: string, name: string, run: () => string): BenchmarkResult {
  const start = now();
  const detail = run();
  return { id, name, ms: now() - start, detail };
}

/** CPU-bound work that shows how fast the interpreter is. */
export function runBenchmarks(): BenchmarkResult[] {
  return [
    time('fib', 'fib(27), recursive calls', () => `= ${fib(27)}`),
    time('sort', 'Sort 200,000 numbers', () => {
      const numbers = Array.from({ length: 200_000 }, () => Math.random());
      numbers.sort((a, b) => a - b);
      return `min ${numbers[0].toFixed(5)}`;
    }),
    time('json', 'JSON stringify + parse (20,000 objects)', () => {
      const data = Array.from({ length: 20_000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        tags: ['a', 'b', 'c'],
        price: i * 1.5,
      }));
      const json = JSON.stringify(data);
      const parsed = JSON.parse(json) as unknown[];
      return i18n.t('hermes:benchmarks.details.json', {
        mb: (json.length / 1024 / 1024).toFixed(1),
        total: parsed.length,
      });
    }),
    time('string', 'Build a 1M-char string', () => {
      const parts: string[] = [];
      for (let i = 0; i < 100_000; i++) {
        parts.push('abcdefghij');
      }
      return i18n.t('hermes:benchmarks.details.string', {
        total: parts.join('').length,
      });
    }),
    time('map', 'Map with 100,000 keys', () => {
      const map = new Map<string, number>();
      for (let i = 0; i < 100_000; i++) {
        map.set(`key${i}`, i);
      }
      return i18n.t('hermes:benchmarks.details.map', { total: map.size });
    }),
  ];
}
