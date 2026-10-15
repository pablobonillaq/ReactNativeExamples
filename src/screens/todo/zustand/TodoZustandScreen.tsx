import { useTranslation } from 'react-i18next';
import { createAddTodoForm } from '../AddTodoForm';
import { createGenerations } from '../Generations';
import { createTodoList } from '../TodoList';
import { TodoScreenLayout } from '../TodoScreenLayout';
import { useTodoStore } from './useTodoStore';

// The same UI as the Context and Redux screens. The Zustand store already
// has the TodoStore shape, so its hook is used directly.
const AddTodoForm = createAddTodoForm(useTodoStore);
const TodoList = createTodoList(useTodoStore);
const Generation1 = createGenerations(TodoList, 'zustand');

/**
 * Zustand demo. There is no Provider: the store is a module-level hook, so
 * the form and the list (5 components deep) use it directly and the
 * generations in between pass no props.
 */
export function TodoZustandScreen() {
  const { t } = useTranslation('todo');
  return (
    <TodoScreenLayout caption={t('captions.zustand')}>
      <AddTodoForm />
      <Generation1 />
    </TodoScreenLayout>
  );
}
