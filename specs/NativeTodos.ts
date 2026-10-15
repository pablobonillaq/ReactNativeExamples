import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Turbo Native Module spec (New Architecture).
 *
 * This file is the contract between JavaScript and native code. Codegen reads
 * it at build time (codegenConfig in package.json) and generates:
 * - Android: the abstract class `NativeTodosSpec` (Java) that
 *   NativeTodosModule.kt extends.
 * - iOS: the protocol `NativeTodosSpec` and the C++ class
 *   `NativeTodosSpecJSI` that RCTNativeTodos.mm implements.
 *
 * Calls go through JSI (no JSON bridge): JS calls a C++ host object that
 * converts the arguments and invokes the Kotlin / Objective-C method.
 *
 * Only types Codegen understands are allowed here: string, number, boolean,
 * `| null`, object type aliases, Array<T>, Promise<T> and void.
 */

/** A todo as the native side stores it. `date` is milliseconds since 1970. */
export type NativeTodo = {
  id: string;
  text: string;
  date: number;
  completed: boolean;
};

/** Where and how the native side keeps the data. */
export type NativeTodosInfo = {
  platform: string;
  storage: string;
  key: string;
};

export interface Spec extends TurboModule {
  // Asynchronous methods: they return a Promise and run off the JS thread.

  /** Every todo, oldest first. */
  getAll(): Promise<Array<NativeTodo>>;
  /** Todos whose text contains `query` (ignores case and accents). */
  search(query: string): Promise<Array<NativeTodo>>;
  /** Saves a new todo and returns it with the id the native side created. */
  add(text: string, date: number, completed: boolean): Promise<NativeTodo>;
  /** Changes only the fields that aren't null. Rejects if `todoId` is unknown. */
  update(
    todoId: string,
    text: string | null,
    date: number | null,
    completed: boolean | null,
  ): Promise<NativeTodo>;
  /** Resolves true if a todo was deleted. */
  remove(todoId: string): Promise<boolean>;
  /** Deletes every todo. */
  clear(): Promise<void>;

  // Synchronous methods: JS waits for the answer, like a normal function call.
  // Possible because JSI calls native code directly; keep them fast.

  /** Number of todos saved. */
  count(): number;
  /** Platform, storage API and key used by the native side. */
  getInfo(): NativeTodosInfo;
}

/**
 * `get` (not `getEnforcing`) returns null instead of throwing when the native
 * side isn't there: in Jest, or when the app wasn't rebuilt after adding the
 * native code. The screen shows a message in that case.
 */
export default TurboModuleRegistry.get<Spec>('NativeTodos');
