import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import type { TodoStore } from '../types';
import {
  selectTodos,
  todoAdded,
  todoRemoved,
  todoToggled,
  todoUpdated,
} from './todosSlice';

/**
 * Same shape as the Context's useTodos(), backed by Redux:
 * useSelector reads the todos and useDispatch sends the actions.
 */
export function useReduxTodos(): TodoStore {
  const todos = useAppSelector(selectTodos);
  const dispatch = useAppDispatch();

  const actions = useMemo(
    () => ({
      addTodo: (todo: Parameters<TodoStore['addTodo']>[0]) =>
        dispatch(todoAdded(todo)),
      updateTodo: (...[id, changes]: Parameters<TodoStore['updateTodo']>) => {
        const { date, ...rest } = changes;
        dispatch(
          todoUpdated({
            id,
            changes: date ? { ...rest, date: date.toISOString() } : rest,
          }),
        );
      },
      toggleTodo: (id: string) => dispatch(todoToggled(id)),
      removeTodo: (id: string) => dispatch(todoRemoved(id)),
    }),
    [dispatch],
  );

  return useMemo(() => ({ todos, ...actions }), [todos, actions]);
}
