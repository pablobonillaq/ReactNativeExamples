import NativeBridgeDemo, { type Spec } from '../../../specs/NativeBridgeDemo';

/**
 * Access to the NativeBridgeDemo Turbo Module, through a function so tests
 * can swap it for a fake (Kotlin / Objective-C++ don't run in Jest).
 */
let current: Spec | null = NativeBridgeDemo ?? null;

export function getBridge(): Spec | null {
  return current;
}

/** Test helper: use a fake module, or null to simulate a missing one. */
export function setBridgeModuleForTests(fake: Spec | null) {
  current = fake;
}

/** High-resolution time in ms (performance isn't in this project's TS lib). */
export function now(): number {
  const perf = (globalThis as unknown as { performance?: { now(): number } })
    .performance;
  return perf ? perf.now() : Date.now();
}

/** Measures how long `run` takes, in ms. */
export function timed<T>(run: () => T): { value: T; ms: number } {
  const start = now();
  const value = run();
  return { value, ms: now() - start };
}

export async function timedAsync<T>(
  run: () => Promise<T>,
): Promise<{ value: T; ms: number }> {
  const start = now();
  const value = await run();
  return { value, ms: now() - start };
}

export type BenchmarkResult = {
  /** Stable id, used to show a translated name (bridging:benchmark.names). */
  id: 'js' | 'sync' | 'async';
  /** English name, for logs. */
  name: string;
  calls: number;
  totalMs: number;
  /** microseconds per call */
  perCallUs: number;
};

function result(
  id: BenchmarkResult['id'],
  name: string,
  calls: number,
  totalMs: number,
): BenchmarkResult {
  return { id, name, calls, totalMs, perCallUs: (totalMs * 1000) / calls };
}

const jsAdd = (a: number, b: number) => a + b;

/**
 * The same tiny job (a + b) done N times three ways: plain JS, a sync native
 * call and an async native call. The difference is the cost of crossing.
 */
export async function runBridgeBenchmark(
  bridge: Spec,
  calls: number,
): Promise<BenchmarkResult[]> {
  let sum = 0;
  let start = now();
  for (let i = 0; i < calls; i++) {
    sum = jsAdd(sum, 1);
  }
  const js = result('js', 'Plain JS function', calls, now() - start);

  sum = 0;
  start = now();
  for (let i = 0; i < calls; i++) {
    sum = bridge.add(sum, 1);
  }
  const sync = result('sync', 'Native sync add()', calls, now() - start);

  sum = 0;
  start = now();
  for (let i = 0; i < calls; i++) {
    // One at a time: each call waits for the native thread and the Promise.
    sum = await bridge.addAsync(sum, 1);
  }
  const asyncResult = result(
    'async',
    'Native async addAsync()',
    calls,
    now() - start,
  );

  return [js, sync, asyncResult];
}
