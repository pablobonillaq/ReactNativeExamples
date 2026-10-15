import { useTranslation } from 'react-i18next';
import { createAddTodoForm } from './AddTodoForm';
import { createGenerations } from './Generations';
import { TodoProvider, useTodos } from './TodoContext';
import { createTodoList } from './TodoList';
import { TodoScreenLayout } from './TodoScreenLayout';

// The shared UI, bound to the Context store.
const AddTodoForm = createAddTodoForm(useTodos);
const TodoList = createTodoList(useTodos);
const Generation1 = createGenerations(TodoList, 'context');

/**
 * Context API demo. TodoProvider wraps the whole screen; the form (top) and
 * the list (5 components deep) both use the same todos through useTodos(),
 * and none of the components in between pass any props.
 */
export function TodoScreen() {
  const { t } = useTranslation('todo');
  return (
    <TodoProvider>
      <TodoScreenLayout caption={t('captions.context')}>
        <AddTodoForm />
        <Generation1 />
      </TodoScreenLayout>
    </TodoProvider>
  );
}
