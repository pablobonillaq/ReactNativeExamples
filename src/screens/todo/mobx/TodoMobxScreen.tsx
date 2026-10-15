import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { createAddTodoForm } from '../AddTodoForm';
import { createGenerations } from '../Generations';
import { createTodoList, type ComponentWrapper } from '../TodoList';
import { TodoScreenLayout } from '../TodoScreenLayout';
import { useMobxTodos } from './todoMobxStore';

// The same UI as the other todo screens. The list and its items are wrapped
// in `observer` so they react to changes in the MobX store. The form only
// calls an action (it reads no observable data), so it doesn't need it.
const AddTodoForm = createAddTodoForm(useMobxTodos);
const TodoList = createTodoList(
  useMobxTodos,
  observer as unknown as ComponentWrapper,
);
const Generation1 = createGenerations(TodoList, 'mobx');

/**
 * MobX demo. The store is a single class instance (no Provider); the
 * components that read it are wrapped in `observer`, and the 5 generations
 * in between pass no props.
 */
export function TodoMobxScreen() {
  const { t } = useTranslation('todo');
  return (
    <TodoScreenLayout caption={t('captions.mobx')}>
      <AddTodoForm />
      <Generation1 />
    </TodoScreenLayout>
  );
}
