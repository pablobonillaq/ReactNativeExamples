import * as Sentry from '@sentry/react-native';
import { useSyncExternalStore } from 'react';
import NativeTodos, {
  type NativeTodo,
  type NativeTodosInfo,
  type Spec,
} from '../../../../specs/NativeTodos';
import i18n from '../../../i18n';
import { createLogger } from '../../../observability/logger';
import type { NewTodo, Todo, TodoStore } from '../types';

const log = createLogger('NativeTodos');

/**
 * Todo store backed by a Turbo Native Module (specs/NativeTodos.ts).
 *
 * The native side (Kotlin on Android, Objective-C++ on iOS) owns the data
 * and saves it in SharedPreferences / NSUserDefaults. JS keeps only a copy
 * of what the screen shows: after every change it asks native again
 * (getAll, or search when there is a query).
 *
 * Every native call is timed and kept in `calls`, so the screen can show
 * what crossed from JS to native and back.
 */

/** One call to the native module, as shown in the call log. */
export type NativeCall = {
  id: number;
  method: string;
  args: string;
  result: string;
  ms: number;
  sync: boolean;
  failed: boolean;
};

export type NativeTodosState = {
  /** false when the native module isn't registered (app not rebuilt, Jest). */
  available: boolean;
  /** The todos on screen: all of them, or the search results. */
  todos: Todo[];
  query: string;
  /** How many todos are saved (sync call to native count()). */
  total: number;
  info: NativeTodosInfo | null;
  calls: NativeCall[];
  loaded: boolean;
};

const MAX_CALLS = 8;

let native: Spec | null = NativeTodos ?? null;
let state: NativeTodosState = initialState();
let nextCallId = 1;
// Increases with every refresh; an older answer that arrives late is ignored
// (typing fast in the search box sends several searches).
let refreshId = 0;
const listeners = new Set<() => void>();

function initialState(): NativeTodosState {
  return {
    available: native !== null,
    todos: [],
    query: '',
    total: 0,
    info: null,
    calls: [],
    loaded: false,
  };
}

function setState(changes: Partial<NativeTodosState>) {
  state = { ...state, ...changes };
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function now(): number {
  const perf = (globalThis as unknown as { performance?: { now(): number } })
    .performance;
  return perf ? perf.now() : Date.now();
}

/** Native todos carry the date as a number (ms); the UI uses Date. */
function toTodo(todo: NativeTodo): Todo {
  return {
    id: todo.id,
    text: todo.text,
    date: new Date(todo.date),
    completed: todo.completed,
  };
}

function describe(value: unknown): string {
  if (Array.isArray(value)) {
    // Shown in the call log: translated when the call is recorded.
    return i18n.t('todo:native.calls.todoCount', { count: value.length });
  }
  if (value && typeof value === 'object' && 'id' in value) {
    return `{ id: "${(value as NativeTodo).id}", … }`;
  }
  if (value && typeof value === 'object') {
    return '{ … }';
  }
  return String(value);
}

function record(call: Omit<NativeCall, 'id'>) {
  setState({
    calls: [{ id: nextCallId++, ...call }, ...state.calls].slice(0, MAX_CALLS),
  });
}

function formatArgs(args: unknown[]) {
  return args.map(arg => JSON.stringify(arg) ?? 'undefined').join(', ');
}

/** Calls an async native method, timing it and logging the result. */
async function callAsync<T>(
  method: string,
  args: unknown[],
  run: (module: Spec) => Promise<T>,
): Promise<T | undefined> {
  const module = native;
  if (!module) {
    return undefined;
  }
  const start = now();
  try {
    const result = await Sentry.startSpan(
      { name: `NativeTodos.${method}`, op: 'native.call' },
      () => run(module),
    );
    record({
      method,
      args: formatArgs(args),
      result: describe(result),
      ms: now() - start,
      sync: false,
      failed: false,
    });
    return result;
  } catch (error) {
    // Native code rejected the promise: the error has its code (E_NOT_FOUND…).
    const { code, message } = error as { code?: string; message?: string };
    record({
      method,
      args: formatArgs(args),
      result: `rejected ${code ?? ''} ${message ?? ''}`.trim(),
      ms: now() - start,
      sync: false,
      failed: true,
    });
    log.error(`NativeTodos.${method} failed`, error, { method });
    return undefined;
  }
}

/** Calls a sync native method: the value comes back right away. */
function callSync<T>(method: string, run: (module: Spec) => T): T | undefined {
  const module = native;
  if (!module) {
    return undefined;
  }
  const start = now();
  const result = run(module);
  record({
    method,
    args: '',
    result: describe(result),
    ms: now() - start,
    sync: true,
    failed: false,
  });
  return result;
}

/** Asks native for what the screen shows: all todos or the search results. */
async function refresh() {
  const id = ++refreshId;
  const query = state.query.trim();
  const list = query
    ? await callAsync('search', [query], m => m.search(query))
    : await callAsync('getAll', [], m => m.getAll());
  if (id !== refreshId || list === undefined) {
    return; // a newer refresh already started
  }
  const total = callSync('count', m => m.count()) ?? list.length;
  setState({ todos: list.map(toTodo), total, loaded: true });
}

/** First load: the sync getInfo() and the list. Called by the screen. */
export async function loadNativeTodos() {
  if (!native) {
    log.warn('NativeTodos module not found: rebuild the native app');
    return;
  }
  if (!state.info) {
    setState({ info: callSync('getInfo', m => m.getInfo()) ?? null });
  }
  await refresh();
}

const actions = {
  addTodo: async (todo: NewTodo) => {
    await callAsync(
      'add',
      [todo.text, todo.date.getTime(), todo.completed],
      m => m.add(todo.text, todo.date.getTime(), todo.completed),
    );
    log.info('Todo added natively');
    await refresh();
  },
  updateTodo: async (id: string, changes: Partial<NewTodo>) => {
    // null = "leave this field as it is" on the native side.
    const text = changes.text ?? null;
    const date = changes.date ? changes.date.getTime() : null;
    const completed = changes.completed ?? null;
    await callAsync('update', [id, text, date, completed], m =>
      m.update(id, text, date, completed),
    );
    await refresh();
  },
  toggleTodo: async (id: string) => {
    const todo = state.todos.find(t => t.id === id);
    if (!todo) {
      return;
    }
    await callAsync('update', [id, null, null, !todo.completed], m =>
      m.update(id, null, null, !todo.completed),
    );
    await refresh();
  },
  removeTodo: async (id: string) => {
    await callAsync('remove', [id], m => m.remove(id));
    await refresh();
  },
};

/** Changes the search text; native search() runs on every change. */
export function setNativeTodoQuery(query: string) {
  setState({ query });
  return refresh();
}

/** Deletes every saved todo (native clear()). */
export async function clearNativeTodos() {
  await callAsync('clear', [], m => m.clear());
  await refresh();
}

/** Same shape as the other todo stores, backed by the native module. */
export function useNativeTodos(): TodoStore {
  const { todos } = useSyncExternalStore(subscribe, getSnapshot);
  return { todos, ...actions };
}

/** Everything else the screen shows: query, total, info and call log. */
export function useNativeTodosState(): NativeTodosState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Test helper: use a fake native module and start from scratch. */
export function resetNativeTodoStoreForTests(module: Spec | null) {
  native = module;
  state = initialState();
  nextCallId = 1;
  refreshId = 0;
  listeners.clear();
}
