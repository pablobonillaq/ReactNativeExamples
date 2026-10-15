import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { createNativeTodosFake } from '../__mocks__/nativeTodosFake';
import { TodoNativeScreen } from '../src/screens/todo/native/TodoNativeScreen';
import {
  clearNativeTodos,
  loadNativeTodos,
  resetNativeTodoStoreForTests,
  setNativeTodoQuery,
  useNativeTodos,
  useNativeTodosState,
  type NativeTodosState,
} from '../src/screens/todo/native/todoNativeStore';
import type { TodoStore } from '../src/screens/todo/types';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('@react-navigation/elements', () => ({
  useHeaderHeight: () => 0,
}));

// The real module is Kotlin / Objective-C++; in Jest the store talks to an
// in-memory fake with the same rules (see __mocks__/nativeTodosFake.ts).

const date = new Date(2026, 9, 5);

function renderStore() {
  const ref: {
    store: TodoStore | null;
    state: NativeTodosState | null;
  } = { store: null, state: null };
  function Probe() {
    ref.store = useNativeTodos();
    ref.state = useNativeTodosState();
    return null;
  }
  act(() => {
    create(<Probe />);
  });
  return ref;
}

beforeEach(() => {
  resetNativeTodoStoreForTests(createNativeTodosFake());
});

test('loads the info (sync) and the list (async)', async () => {
  const ref = renderStore();
  await act(() => loadNativeTodos());
  expect(ref.state!.info?.storage).toBe('memory');
  expect(ref.state!.loaded).toBe(true);
  expect(ref.store!.todos).toEqual([]);
  expect(ref.state!.calls.map(c => c.method)).toEqual([
    'count',
    'getAll',
    'getInfo',
  ]);
});

test('add, update, toggle and remove go through the native module', async () => {
  const ref = renderStore();
  await act(() => loadNativeTodos());

  await act(async () => {
    await ref.store!.addTodo({ text: 'Café', date, completed: false });
    await ref.store!.addTodo({ text: 'Milk', date, completed: true });
  });
  expect(ref.store!.todos).toEqual([
    { id: '1', text: 'Café', date, completed: false },
    { id: '2', text: 'Milk', date, completed: true },
  ]);

  const newDate = new Date(2027, 0, 1);
  await act(async () => {
    await ref.store!.toggleTodo('1');
    await ref.store!.updateTodo('2', { text: 'Oat milk', date: newDate });
  });
  expect(ref.store!.todos).toEqual([
    { id: '1', text: 'Café', date, completed: true },
    { id: '2', text: 'Oat milk', date: newDate, completed: true },
  ]);

  await act(async () => {
    await ref.store!.removeTodo('1');
  });
  expect(ref.store!.todos.map(t => t.text)).toEqual(['Oat milk']);
  expect(ref.state!.total).toBe(1);
});

test('search ignores case and accents; total counts every todo', async () => {
  const ref = renderStore();
  await act(() => loadNativeTodos());
  await act(async () => {
    await ref.store!.addTodo({
      text: 'Café con leche',
      date,
      completed: false,
    });
    await ref.store!.addTodo({ text: 'Pay rent', date, completed: false });
  });

  await act(() => setNativeTodoQuery('CAFE'));
  expect(ref.store!.todos.map(t => t.text)).toEqual(['Café con leche']);
  expect(ref.state!.total).toBe(2);

  await act(() => setNativeTodoQuery(''));
  expect(ref.store!.todos).toHaveLength(2);

  await act(() => clearNativeTodos());
  expect(ref.store!.todos).toEqual([]);
  expect(ref.state!.total).toBe(0);
});

test('a native rejection is shown in the call log as failed', async () => {
  const ref = renderStore();
  await act(() => loadNativeTodos());
  await act(() => ref.store!.updateTodo('99', { text: 'Nope' }));
  const [last] = ref.state!.calls.filter(c => c.method === 'update');
  expect(last.failed).toBe(true);
  expect(last.result).toContain('E_NOT_FOUND');
});

async function renderScreen() {
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(<TodoNativeScreen />);
  });
  return JSON.stringify(tree.toJSON());
}

test('the screen shows the native info and the call log', async () => {
  const text = await renderScreen();
  expect(text).toContain('How it works');
  expect(text).toContain('Jest (fake)');
  expect(text).toContain('Native calls');
});

test('without the native module the screen explains how to rebuild', async () => {
  resetNativeTodoStoreForTests(null);
  const text = await renderScreen();
  expect(text).toContain('Native module not found');
  // Jest runs as iOS by default, so it shows the pod install + ios command.
  expect(text).toContain('npm run ios');
});
