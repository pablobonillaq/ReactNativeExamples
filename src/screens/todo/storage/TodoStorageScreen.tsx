import { useTranslation } from 'react-i18next';
import { createAddTodoForm } from '../AddTodoForm';
import { createGenerations } from '../Generations';
import { createTodoList } from '../TodoList';
import { TodoScreenLayout } from '../TodoScreenLayout';
import { useStorageTodos } from './todoStorageStore';

// The same UI as the other todo screens, bound to the AsyncStorage store.
const AddTodoForm = createAddTodoForm(useStorageTodos);
const TodoList = createTodoList(useStorageTodos);
const Generation1 = createGenerations(TodoList, 'storage');

/**
 * AsyncStorage (React Native's localStorage) demo. The todos are saved on
 * the device, so they are still there after closing and reopening the app.
 */
export function TodoStorageScreen() {
  const { t } = useTranslation('todo');
  return (
    <TodoScreenLayout caption={t('captions.storage')}>
      <AddTodoForm />
      <Generation1 />
    </TodoScreenLayout>
  );
}
