import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { createLogger } from '../../observability/logger';
import type { NewTodo, Todo, TodoStore } from './types';

const log = createLogger('TodoContext');

export type { NewTodo, Todo } from './types';

type Action =
  | { type: 'add'; todo: NewTodo }
  | { type: 'update'; id: string; changes: Partial<NewTodo> }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string };

let nextId = 1;

/** Pure function: easy to test and the only place where todos change. */
export function todosReducer(todos: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add':
      return [...todos, { ...action.todo, id: String(nextId++) }];
    case 'update':
      return todos.map(t =>
        t.id === action.id ? { ...t, ...action.changes } : t,
      );
    case 'toggle':
      return todos.map(t =>
        t.id === action.id ? { ...t, completed: !t.completed } : t,
      );
    case 'remove':
      return todos.filter(t => t.id !== action.id);
  }
}

const TodoContext = createContext<TodoStore | null>(null);

/**
 * Holds the todo list. Any component below it can read or change the todos
 * with useTodos(), no matter how deep it is: no props needed in between.
 */
export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, rawDispatch] = useReducer(todosReducer, []);
  // The reducer stays pure; actions are logged where they're dispatched.
  const dispatch = useCallback((action: Action) => {
    log.debug(
      `dispatch ${action.type}`,
      'id' in action ? { id: action.id } : {},
    );
    rawDispatch(action);
  }, []);

  // Memoized so consumers only re-render when the todos change.
  const value = useMemo<TodoStore>(
    () => ({
      todos,
      addTodo: todo => dispatch({ type: 'add', todo }),
      updateTodo: (id, changes) => dispatch({ type: 'update', id, changes }),
      toggleTodo: id => dispatch({ type: 'toggle', id }),
      removeTodo: id => dispatch({ type: 'remove', id }),
    }),
    [todos, dispatch],
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos(): TodoStore {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used inside a <TodoProvider>');
  }
  return context;
}
