import {
  createSelector,
  createSlice,
  nanoid,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { NewTodo, Todo } from '../types';

/**
 * Redux state must be serializable, so dates are stored as ISO strings and
 * turned back into Date objects by the selector.
 */
export type StoredTodo = Omit<Todo, 'date'> & { date: string };

type TodosState = { items: StoredTodo[] };

const initialState: TodosState = { items: [] };

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded: {
      // Immer lets reducers "mutate" the draft; it produces a new state.
      reducer(state, action: PayloadAction<StoredTodo>) {
        state.items.push(action.payload);
      },
      // prepare builds the payload: generates the id and serializes the date.
      prepare(todo: NewTodo) {
        return {
          payload: { ...todo, id: nanoid(), date: todo.date.toISOString() },
        };
      },
    },
    todoUpdated(
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<Omit<StoredTodo, 'id'>>;
      }>,
    ) {
      const todo = state.items.find(t => t.id === action.payload.id);
      if (todo) {
        Object.assign(todo, action.payload.changes);
      }
    },
    todoToggled(state, action: PayloadAction<string>) {
      const todo = state.items.find(t => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    todoRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
  },
});

export const { todoAdded, todoUpdated, todoToggled, todoRemoved } =
  todosSlice.actions;
export const todosReducer = todosSlice.reducer;

/** Memoized: returns the same array until the stored todos change. */
export const selectTodos = createSelector(
  (state: { todos: TodosState }) => state.todos.items,
  (items): Todo[] => items.map(t => ({ ...t, date: new Date(t.date) })),
);
