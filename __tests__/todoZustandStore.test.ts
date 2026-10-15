import { useTodoStore } from '../src/screens/todo/zustand/useTodoStore';

const date = new Date(2026, 8, 30);
const initialState = useTodoStore.getState();

beforeEach(() => {
  // Zustand stores are module singletons: reset between tests.
  useTodoStore.setState(initialState, true);
});

test('adds, toggles, updates and removes todos', () => {
  const store = () => useTodoStore.getState();

  store().addTodo({ text: 'A', date, completed: false });
  store().addTodo({ text: 'B', date, completed: false });
  const [a, b] = store().todos;
  expect(a.id).not.toBe(b.id);

  store().toggleTodo(a.id);
  store().updateTodo(b.id, { text: 'B2' });
  expect(store().todos.map(t => [t.text, t.completed])).toEqual([
    ['A', true],
    ['B2', false],
  ]);

  store().removeTodo(a.id);
  expect(store().todos.map(t => t.text)).toEqual(['B2']);
});

test('keeps dates as Date objects', () => {
  useTodoStore.getState().addTodo({ text: 'A', date, completed: false });
  expect(useTodoStore.getState().todos[0].date).toBe(date);
});
