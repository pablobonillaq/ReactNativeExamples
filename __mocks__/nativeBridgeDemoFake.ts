import type { Spec, TickEvent } from '../specs/NativeBridgeDemo';

/**
 * In-memory stand-in for the NativeBridgeDemo Turbo Module, for Jest.
 * Behaves like the Kotlin / Objective-C++ code; ticks are sent manually with
 * `emitTick()` instead of a native timer.
 */
export function createNativeBridgeDemoFake(): Spec & {
  emitTick(): void;
  ticking: boolean;
} {
  const listeners = new Set<(event: TickEvent) => void>();
  let count = 0;

  const fake = {
    ticking: false,
    currentThread: () => 'jest-js',
    add: (a: number, b: number) => a + b,
    asyncThread: async () => 'jest-native',
    addAsync: async (a: number, b: number) => a + b,
    withCallback: (value: number, callback: (message: string) => void) =>
      callback(`Fake got ${value} and sends back ${value * 2}`),
    startTicking: () => {
      count = 0;
      fake.ticking = true;
    },
    stopTicking: () => {
      fake.ticking = false;
    },
    onTick: (handler: (event: TickEvent) => void) => {
      listeners.add(handler);
      return { remove: () => listeners.delete(handler) };
    },
    emitTick: () => {
      count++;
      const event = { count, timestamp: Date.now(), thread: 'jest-main' };
      listeners.forEach(listener => listener(event));
    },
    echo: (value: object) =>
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          item === null ? 'null' : typeof item,
        ]),
      ),
    fail: async (code: string, message: string) => {
      throw Object.assign(new Error(message), { code });
    },
  };
  return fake;
}
