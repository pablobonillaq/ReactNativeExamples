import { act, create } from 'react-test-renderer';
import {
  initTodoDatabase,
  resetTodoSqliteStoreForTests,
  useSqliteTodos,
} from '../src/screens/todo/sqlite/todoSqliteStore';
import type { TodoStore } from '../src/screens/todo/types';

// op-sqlite is mocked in jest.setup.js with Node's built-in SQLite, so the
// real SQL statements of the store run in these tests.

const date = new Date(2026, 8, 30);

function renderStore() {
  const ref: { current: TodoStore | null } = { current: null };
  function Probe() {
    ref.current = useSqliteTodos();
    return null;
  }
  act(() => {
    create(<Probe />);
  });
  return ref;
}

beforeEach(() => {
  resetTodoSqliteStoreForTests();
});

test('creates the table and starts empty', async () => {
  const store = renderStore();
  await act(() => initTodoDatabase());
  expect(store.current!.todos).toEqual([]);
});

test('INSERT, UPDATE and DELETE are reflected in the list', async () => {
  const store = renderStore();
  await act(() => initTodoDatabase());

  await act(async () => {
    await store.current!.addTodo({ text: 'A', date, completed: false });
    await store.current!.addTodo({ text: 'B', date, completed: true });
  });
  expect(store.current!.todos).toEqual([
    { id: '1', text: 'A', date, completed: false },
    { id: '2', text: 'B', date, completed: true },
  ]);

  const newDate = new Date(2027, 0, 1);
  await act(async () => {
    await store.current!.toggleTodo('1');
    await store.current!.updateTodo('2', { text: 'B2', date: newDate });
  });
  expect(store.current!.todos).toEqual([
    { id: '1', text: 'A', date, completed: true },
    { id: '2', text: 'B2', date: newDate, completed: true },
  ]);

  await act(async () => {
    await store.current!.removeTodo('1');
  });
  expect(store.current!.todos.map(t => t.text)).toEqual(['B2']);
});
