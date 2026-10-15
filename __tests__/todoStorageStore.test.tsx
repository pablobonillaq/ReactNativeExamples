import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, create } from 'react-test-renderer';
import {
  loadTodos,
  resetTodoStorageStoreForTests,
  STORAGE_KEY,
  useStorageTodos,
} from '../src/screens/todo/storage/todoStorageStore';
import type { TodoStore } from '../src/screens/todo/types';

const date = new Date(2026, 8, 30);

/** Renders a component that exposes the hook's latest value. */
function renderStore() {
  const ref: { current: TodoStore | null } = { current: null };
  function Probe() {
    ref.current = useStorageTodos();
    return null;
  }
  act(() => {
    create(<Probe />);
  });
  return ref;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  resetTodoStorageStoreForTests();
});

test('saves every change to AsyncStorage as JSON', async () => {
  const store = renderStore();
  await act(() => loadTodos());

  await act(async () => {
    store.current!.addTodo({ text: 'Buy milk', date, completed: false });
  });

  const saved = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);
  expect(saved).toEqual([
    expect.objectContaining({
      text: 'Buy milk',
      completed: false,
      date: date.toISOString(),
    }),
  ]);
});

test('loads saved todos back (like reopening the app)', async () => {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      { id: '1', text: 'Saved', completed: true, date: date.toISOString() },
    ]),
  );

  const store = renderStore();
  await act(() => loadTodos());

  expect(store.current!.todos).toEqual([
    { id: '1', text: 'Saved', completed: true, date },
  ]);
});

test('toggle, update and remove are persisted', async () => {
  const store = renderStore();
  await act(() => loadTodos());
  await act(async () => {
    store.current!.addTodo({ text: 'A', date, completed: false });
  });
  const id = store.current!.todos[0].id;

  await act(async () => {
    store.current!.toggleTodo(id);
    store.current!.updateTodo(id, { text: 'A2' });
  });
  let saved = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);
  expect(saved[0]).toMatchObject({ text: 'A2', completed: true });

  await act(async () => {
    store.current!.removeTodo(id);
  });
  saved = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);
  expect(saved).toEqual([]);
});
