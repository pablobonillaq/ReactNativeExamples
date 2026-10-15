import { create } from 'zustand';
import { createLogger } from '../../../observability/logger';
import type { Todo, TodoStore } from '../types';

const log = createLogger('TodoZustand');

let nextId = 1;

/**
 * Zustand store. `create` returns a hook: no Provider is needed, any
 * component can call useTodoStore() and re-renders when the store changes.
 * Unlike Redux, the state doesn't need to be serializable, so dates are kept
 * as Date objects, and actions live in the store next to the data.
 */
export const useTodoStore = create<TodoStore>()(set => ({
  todos: [],
  addTodo: todo =>
    set(state => ({
      todos: [...state.todos, { ...todo, id: String(nextId++) }],
    })),
  updateTodo: (id, changes) =>
    set(state => ({
      todos: state.todos.map(t => (t.id === id ? { ...t, ...changes } : t)),
    })),
  toggleTodo: id =>
    set(state => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    })),
  removeTodo: id =>
    set(state => ({ todos: state.todos.filter((t: Todo) => t.id !== id) })),
}));

// subscribe() runs after every change, outside React: handy for logging.
useTodoStore.subscribe((state, previous) => {
  log.debug('State changed', {
    before: previous.todos.length,
    after: state.todos.length,
  });
});
