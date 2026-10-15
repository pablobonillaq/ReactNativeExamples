import type { NativeTodo, Spec } from '../specs/NativeTodos';

/**
 * In-memory stand-in for the NativeTodos Turbo Module, for Jest (the real one
 * is Kotlin / Objective-C++). Follows the same rules as the native code:
 * incremental ids, null = "don't change", search ignores case and accents,
 * update rejects with E_NOT_FOUND.
 */
export function createNativeTodosFake(): Spec {
  let todos: NativeTodo[] = [];
  let nextId = 1;

  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/\p{Mn}/gu, '')
      .toLowerCase();

  return {
    getAll: async () => todos.map(t => ({ ...t })),
    search: async query => {
      const needle = normalize(query.trim());
      return todos.filter(t => normalize(t.text).includes(needle));
    },
    add: async (text, date, completed) => {
      if (!text.trim()) {
        throw Object.assign(new Error("The todo text can't be empty"), {
          code: 'E_EMPTY_TEXT',
        });
      }
      const todo = { id: String(nextId++), text: text.trim(), date, completed };
      todos.push(todo);
      return { ...todo };
    },
    update: async (todoId, text, date, completed) => {
      const index = todos.findIndex(t => t.id === todoId);
      if (index === -1) {
        throw Object.assign(new Error(`No todo with id ${todoId}`), {
          code: 'E_NOT_FOUND',
        });
      }
      const current = todos[index];
      const changed = {
        ...current,
        text: text?.trim() ?? current.text,
        date: date ?? current.date,
        completed: completed ?? current.completed,
      };
      todos[index] = changed;
      return { ...changed };
    },
    remove: async todoId => {
      const before = todos.length;
      todos = todos.filter(t => t.id !== todoId);
      return todos.length < before;
    },
    clear: async () => {
      todos = [];
    },
    count: () => todos.length,
    getInfo: () => ({
      platform: 'Jest (fake)',
      storage: 'memory',
      key: 'todos',
    }),
  };
}
