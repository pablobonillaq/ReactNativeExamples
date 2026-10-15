import { makeAutoObservable } from 'mobx';
import { createLogger } from '../../../observability/logger';
import type { NewTodo, Todo, TodoStore } from '../types';

const log = createLogger('TodoMobx');

let nextId = 1;

/**
 * MobX store. makeAutoObservable turns the fields into observables and the
 * methods into actions, so the state is changed by mutating it directly
 * (push, assignment...). Components wrapped in `observer` re-render only when
 * the specific data they read changes: toggling one todo re-renders that
 * todo's item and the counter, not the rest of the list.
 */
export class TodoMobxStore implements TodoStore {
  todos: Todo[] = [];

  constructor() {
    // autoBind keeps `this` when methods are destructured
    // (const { toggleTodo } = store).
    makeAutoObservable(this, {}, { autoBind: true });
  }

  addTodo(todo: NewTodo) {
    const id = String(nextId++);
    this.todos.push({ ...todo, id });
    log.debug('addTodo', { id });
  }

  updateTodo(id: string, changes: Partial<NewTodo>) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      Object.assign(todo, changes);
      log.debug('updateTodo', { id, fields: Object.keys(changes).join(',') });
    } else {
      log.warn('updateTodo: id not found', { id });
    }
  }

  toggleTodo(id: string) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      log.debug('toggleTodo', { id, completed: todo.completed });
    } else {
      log.warn('toggleTodo: id not found', { id });
    }
  }

  removeTodo(id: string) {
    this.todos = this.todos.filter(t => t.id !== id);
    log.debug('removeTodo', { id });
  }
}

/** Single app-wide instance. */
export const todoMobxStore = new TodoMobxStore();

/**
 * Hook with the same shape as the other versions. It returns the store
 * itself: reactivity comes from `observer`, not from the hook.
 */
export function useMobxTodos(): TodoStore {
  return todoMobxStore;
}
