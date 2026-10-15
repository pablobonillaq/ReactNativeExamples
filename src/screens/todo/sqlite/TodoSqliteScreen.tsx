import { useTranslation } from 'react-i18next';
import { createAddTodoForm } from '../AddTodoForm';
import { createGenerations } from '../Generations';
import { createTodoList } from '../TodoList';
import { TodoScreenLayout } from '../TodoScreenLayout';
import { useSqliteTodos } from './todoSqliteStore';

// The same UI as the other todo screens, bound to the SQLite store.
const AddTodoForm = createAddTodoForm(useSqliteTodos);
const TodoList = createTodoList(useSqliteTodos);
const Generation1 = createGenerations(TodoList, 'sqlite');

/**
 * SQLite demo. Todos are rows of a `todos` table in a database file on the
 * device, so they are still there after closing and reopening the app.
 */
export function TodoSqliteScreen() {
  const { t } = useTranslation('todo');
  return (
    <TodoScreenLayout caption={t('captions.sqlite')}>
      <AddTodoForm />
      <Generation1 />
    </TodoScreenLayout>
  );
}
