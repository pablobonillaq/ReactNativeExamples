import { configureStore } from '@reduxjs/toolkit';
import {
  selectTodos,
  todoAdded,
  todoRemoved,
  todosReducer,
  todoToggled,
  todoUpdated,
} from '../src/screens/todo/redux/todosSlice';

function makeStore() {
  return configureStore({ reducer: { todos: todosReducer } });
}

const date = new Date(2026, 8, 30);

test('adds todos with an id and a serialized date', () => {
  const store = makeStore();
  store.dispatch(todoAdded({ text: 'Buy milk', date, completed: false }));

  const [stored] = store.getState().todos.items;
  expect(stored.id).toEqual(expect.any(String));
  expect(stored.date).toBe(date.toISOString());

  // The selector gives Date objects back to the UI.
  const [todo] = selectTodos(store.getState());
  expect(todo.date).toEqual(date);
});

test('toggles, updates and removes', () => {
  const store = makeStore();
  store.dispatch(todoAdded({ text: 'A', date, completed: false }));
  store.dispatch(todoAdded({ text: 'B', date, completed: false }));
  const [a, b] = store.getState().todos.items;

  store.dispatch(todoToggled(a.id));
  store.dispatch(todoUpdated({ id: b.id, changes: { text: 'B2' } }));
  expect(selectTodos(store.getState()).map(t => [t.text, t.completed])).toEqual(
    [
      ['A', true],
      ['B2', false],
    ],
  );

  store.dispatch(todoRemoved(a.id));
  expect(selectTodos(store.getState()).map(t => t.text)).toEqual(['B2']);
});

test('selector is memoized while the state does not change', () => {
  const store = makeStore();
  store.dispatch(todoAdded({ text: 'A', date, completed: false }));
  expect(selectTodos(store.getState())).toBe(selectTodos(store.getState()));
});
