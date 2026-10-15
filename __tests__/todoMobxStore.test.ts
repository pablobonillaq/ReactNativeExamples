import { autorun } from 'mobx';
import { TodoMobxStore } from '../src/screens/todo/mobx/todoMobxStore';

const date = new Date(2026, 8, 30);

test('adds, toggles, updates and removes todos', () => {
  const store = new TodoMobxStore();
  store.addTodo({ text: 'A', date, completed: false });
  store.addTodo({ text: 'B', date, completed: false });
  const [a, b] = store.todos;
  expect(a.id).not.toBe(b.id);

  // Methods are bound (autoBind), so they work when destructured.
  const { toggleTodo, updateTodo, removeTodo } = store;
  toggleTodo(a.id);
  updateTodo(b.id, { text: 'B2' });
  expect(store.todos.map(t => [t.text, t.completed])).toEqual([
    ['A', true],
    ['B2', false],
  ]);

  removeTodo(a.id);
  expect(store.todos.map(t => t.text)).toEqual(['B2']);
});

test('reactions run only when the data they read changes', () => {
  const store = new TodoMobxStore();
  store.addTodo({ text: 'A', date, completed: false });
  store.addTodo({ text: 'B', date, completed: false });
  const [a, b] = store.todos;

  const seen: boolean[] = [];
  // Like an observer component that only renders todo A's status.
  const dispose = autorun(() => {
    seen.push(a.completed);
  });

  store.updateTodo(b.id, { text: 'B2' }); // doesn't touch A: no re-run
  store.toggleTodo(a.id); // re-runs
  dispose();

  expect(seen).toEqual([false, true]);
});
