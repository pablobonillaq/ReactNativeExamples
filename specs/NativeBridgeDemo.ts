import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Turbo Native Module used by the "Bridging" screen. Every method shows one
 * way JavaScript and native code (Kotlin / Objective-C++) talk to each other.
 *
 * Codegen turns this file into:
 * - Android: abstract class `NativeBridgeDemoSpec` → NativeBridgeDemoModule.kt
 * - iOS: protocol `NativeBridgeDemoSpec` and base class
 *   `NativeBridgeDemoSpecBase` → RCTNativeBridgeDemo.mm
 */

/** Payload of the onTick event (native → JS). */
export type TickEvent = {
  count: number;
  /** ms since 1970, taken by native code */
  timestamp: number;
  /** native thread that sent the event */
  thread: string;
};

export interface Spec extends TurboModule {
  // 1. Sync call: JS waits for the value (possible thanks to JSI).
  /** Name of the native thread that runs this call. */
  currentThread(): string;
  add(a: number, b: number): number;

  // 2. Async call: returns a Promise; native runs it on another thread.
  /** Name of the native thread that runs an async call. */
  asyncThread(): Promise<string>;
  addAsync(a: number, b: number): Promise<number>;

  // 3. Callback: native calls a JS function back (only once).
  withCallback(value: number, callback: (message: string) => void): void;

  // 4. Events: native sends values to JS whenever it wants.
  startTicking(intervalMs: number): void;
  stopTicking(): void;
  readonly onTick: CodegenTypes.EventEmitter<TickEvent>;

  // 5. Type conversion: native says what type each JS value became.
  echo(value: CodegenTypes.UnsafeObject): CodegenTypes.UnsafeObject;

  // 6. Errors: native rejects the promise with a code and a message.
  fail(code: string, message: string): Promise<void>;
}

/** null when the native side isn't there (Jest, or the app wasn't rebuilt). */
export default TurboModuleRegistry.get<Spec>('NativeBridgeDemo');
