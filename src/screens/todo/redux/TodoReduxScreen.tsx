import { useTranslation } from 'react-i18next';
import { createAddTodoForm } from '../AddTodoForm';
import { createGenerations } from '../Generations';
import { createTodoList } from '../TodoList';
import { TodoScreenLayout } from '../TodoScreenLayout';
import { useReduxTodos } from './useReduxTodos';

// The same UI as the Context screen, bound to the Redux store instead.
const AddTodoForm = createAddTodoForm(useReduxTodos);
const TodoList = createTodoList(useReduxTodos);
const Generation1 = createGenerations(TodoList, 'redux');

/**
 * Redux Toolkit demo. The store is provided once for the whole app
 * (<Provider> in App.tsx); the form and the list read and update it with
 * useSelector / useDispatch, and the 5 generations in between pass no props.
 */
export function TodoReduxScreen() {
  const { t } = useTranslation('todo');
  return (
    <TodoScreenLayout caption={t('captions.redux')}>
      <AddTodoForm />
      <Generation1 />
    </TodoScreenLayout>
  );
}
