import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';
import { createLogger } from '../../../observability/logger';
import type { NewTodo, Todo, TodoStore } from '../types';

const log = createLogger('TodoStorage');

/**
 * React Native has no `localStorage` (it's a browser API). AsyncStorage is
 * its equivalent: a persistent key/value store with the same methods
 * (getItem / setItem / removeItem) but asynchronous. Data survives closing
 * the app.
 *
 * AsyncStorage only stores strings, it doesn't share state between
 * components, so this file adds a tiny store without libraries:
 * - the todos live in memory (module level)
 * - components subscribe with useSyncExternalStore
 * - every change is saved to AsyncStorage as JSON
 * - on first use, the saved todos are loaded back
 */

export const STORAGE_KEY = '@ReactNativeExamples/todos';

/** JSON has no Date type: dates are stored as ISO strings. */
type StoredTodo = Omit<Todo, 'date'> & { date: string };

let todos: Todo[] = [];
let loadRequest: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return todos;
}

async function save() {
  const stored: StoredTodo[] = todos.map(t => ({
    ...t,
    date: t.date.toISOString(),
  }));
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    log.debug('Todos saved', { count: stored.length });
  } catch (error) {
    log.error('Could not save todos', error, { count: stored.length });
  }
}

/** Loads the saved todos once (later calls reuse the same promise). */
export function loadTodos() {
  if (!loadRequest) {
    loadRequest = AsyncStorage.getItem(STORAGE_KEY)
      .then(json => {
        const stored: StoredTodo[] = json ? JSON.parse(json) : [];
        const saved = stored.map(t => ({ ...t, date: new Date(t.date) }));
        // Keep anything added while loading (normally nothing).
        todos = [...saved, ...todos];
        log.info('Todos loaded from AsyncStorage', { count: saved.length });
        emit();
      })
      .catch(error => {
        log.error('Could not load todos', error);
      });
  }
  return loadRequest;
}

function setTodos(action: string, update: (current: Todo[]) => Todo[]) {
  log.debug(action);
  todos = update(todos);
  emit();
  save();
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const actions = {
  addTodo: (todo: NewTodo) =>
    setTodos('addTodo', current => [...current, { ...todo, id: newId() }]),
  updateTodo: (id: string, changes: Partial<NewTodo>) =>
    setTodos(`updateTodo ${id}`, current =>
      current.map(t => (t.id === id ? { ...t, ...changes } : t)),
    ),
  toggleTodo: (id: string) =>
    setTodos(`toggleTodo ${id}`, current =>
      current.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)),
    ),
  removeTodo: (id: string) =>
    setTodos(`removeTodo ${id}`, current => current.filter(t => t.id !== id)),
};

/** Same shape as the other todo stores, backed by AsyncStorage. */
export function useStorageTodos(): TodoStore {
  const current = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    loadTodos();
  }, []);

  return { todos: current, ...actions };
}

/** Test helper: forget the in-memory state so it's loaded again. */
export function resetTodoStorageStoreForTests() {
  todos = [];
  loadRequest = null;
  listeners.clear();
}
