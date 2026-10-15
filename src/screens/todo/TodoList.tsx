import { useState, type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';
import { DateField } from '../../components/form/DateField';
import { currentLocale } from '../../i18n';
import { makeStyles } from '../../theme';
import type { Todo, TodoStore, UseTodoStore } from './types';

function formatDate(date: Date) {
  return date.toLocaleDateString(currentLocale(), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Wraps a component. MobX passes `observer` so the components that read the
 * store re-render when the data they used changes; the other stores (which
 * return new data from their hooks) don't need it.
 */
export type ComponentWrapper = <P extends object>(
  component: FunctionComponent<P>,
) => FunctionComponent<P>;

const noWrap: ComponentWrapper = component => component;

/**
 * Creates the list bound to a store hook (Context, Redux, Zustand, MobX).
 * It's the deepest component: it gets the todos straight from the store.
 */
export function createTodoList(
  useTodoStore: UseTodoStore,
  wrap: ComponentWrapper = noWrap,
) {
  // observer only tracks what a component reads in its own render, so the
  // components that read todos (the list and each item) are the ones wrapped.
  const Item = wrap(TodoItem);
  const ListView = wrap(TodoListView);

  return function TodoList() {
    return <ListView store={useTodoStore()} Item={Item} />;
  };
}

function TodoListView({
  store,
  Item,
}: {
  store: TodoStore;
  Item: FunctionComponent<{ todo: Todo; store: TodoStore }>;
}) {
  const { t } = useTranslation('todo');
  const styles = useStyles();
  const { todos } = store;
  const done = todos.filter(todo => todo.completed).length;

  if (todos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyText}>{t('list.empty')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      <Text style={styles.summary}>
        {t('list.summary', { done, total: todos.length })}
      </Text>
      {todos.map(todo => (
        <Item key={todo.id} todo={todo} store={store} />
      ))}
    </View>
  );
}

function TodoItem({ todo, store }: { todo: Todo; store: TodoStore }) {
  const { t } = useTranslation('todo');
  const styles = useStyles();
  const { toggleTodo, updateTodo, removeTodo } = store;
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(todo.text);
  const [draftDate, setDraftDate] = useState(todo.date);

  const startEditing = () => {
    setDraftText(todo.text);
    setDraftDate(todo.date);
    setEditing(true);
  };

  const save = () => {
    if (!draftText.trim()) {
      return;
    }
    updateTodo(todo.id, { text: draftText.trim(), date: draftDate });
    setEditing(false);
  };

  if (editing) {
    return (
      <View style={[styles.item, styles.itemEditing]}>
        <TextInput
          value={draftText}
          onChangeText={setDraftText}
          style={styles.editInput}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={save}
        />
        <DateField
          label={t('list.date')}
          value={draftDate}
          onChange={setDraftDate}
        />
        <View style={styles.actions}>
          <SmallButton
            label={t('list.cancel')}
            onPress={() => setEditing(false)}
          />
          <SmallButton
            label={t('list.save')}
            primary
            disabled={!draftText.trim()}
            onPress={save}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.item}>
      <Pressable
        onPress={() => toggleTodo(todo.id)}
        hitSlop={8}
        style={[styles.checkbox, todo.completed && styles.checkboxChecked]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.completed }}
      >
        {todo.completed ? <Text style={styles.checkmark}>✓</Text> : null}
      </Pressable>
      <View style={styles.itemBody}>
        <Text
          // Android doesn't redraw textDecorationLine when it changes on an
          // existing Text; a new key remounts it so the line-through shows.
          key={todo.completed ? 'done' : 'pending'}
          style={[styles.itemText, todo.completed && styles.itemTextDone]}
        >
          {todo.text}
        </Text>
        <Text style={styles.itemDate}>📅 {formatDate(todo.date)}</Text>
      </View>
      <Pressable onPress={startEditing} hitSlop={8} style={styles.iconButton}>
        <Text style={styles.icon}>✏️</Text>
      </Pressable>
      <Pressable
        onPress={() => removeTodo(todo.id)}
        hitSlop={8}
        style={styles.iconButton}
      >
        <Text style={styles.icon}>🗑️</Text>
      </Pressable>
    </View>
  );
}

function SmallButton({
  label,
  onPress,
  primary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.smallButton,
        primary && styles.smallButtonPrimary,
        disabled && styles.smallButtonDisabled,
      ]}
    >
      <Text
        style={[
          styles.smallButtonText,
          primary && styles.smallButtonTextPrimary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles(c => ({
  empty: {
    alignItems: 'center',
    gap: 6,
    padding: 24,
    borderRadius: 8,
    backgroundColor: c.surface,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 14,
    color: c.textMuted,
  },
  list: {
    gap: 6,
  },
  summary: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textMuted,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: c.surface,
  },
  itemEditing: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 6,
    borderColor: c.textMuted,
  },
  checkboxChecked: {
    borderColor: c.success,
    backgroundColor: c.success,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '800',
    color: c.textOnPrimary,
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  itemText: {
    fontSize: 15,
    color: c.text,
  },
  itemTextDone: {
    color: c.textMuted,
    textDecorationLine: 'line-through',
  },
  itemDate: {
    fontSize: 12,
    color: c.textMuted,
  },
  iconButton: {
    padding: 2,
  },
  icon: {
    fontSize: 18,
  },
  editInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: c.text,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: c.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: c.surfaceMuted,
  },
  smallButtonPrimary: {
    backgroundColor: c.primary,
  },
  smallButtonDisabled: {
    opacity: 0.4,
  },
  smallButtonText: {
    fontWeight: '600',
    color: c.textSecondary,
  },
  smallButtonTextPrimary: {
    color: c.textOnPrimary,
  },
}));
