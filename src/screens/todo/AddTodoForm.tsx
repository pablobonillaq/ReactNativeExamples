import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Switch, Text, View } from 'react-native';
import { DateField } from '../../components/form/DateField';
import { TextField } from '../../components/form/TextField';
import { makeStyles, useTheme } from '../../theme';
import type { UseTodoStore } from './types';

/**
 * Creates the "add todo" form bound to a store hook (Context or Redux).
 * Called once at module level; the component itself takes no props.
 */
export function createAddTodoForm(useTodoStore: UseTodoStore) {
  return function AddTodoForm() {
    const { addTodo } = useTodoStore();
    return <AddTodoFormView onAdd={addTodo} />;
  };
}

function AddTodoFormView({
  onAdd: addTodo,
}: {
  onAdd: ReturnType<UseTodoStore>['addTodo'];
}) {
  const { t } = useTranslation('todo');
  const styles = useStyles();
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [completed, setCompleted] = useState(false);
  const canAdd = text.trim().length > 0;

  const add = () => {
    if (!canAdd) {
      return;
    }
    addTodo({ text: text.trim(), date, completed });
    setText('');
    setCompleted(false);
  };

  return (
    <View style={styles.card}>
      <TextField
        label={t('form.task')}
        icon="📝"
        value={text}
        onChangeText={setText}
        placeholder={t('form.placeholder')}
        returnKeyType="done"
        onSubmitEditing={add}
      />
      <DateField label={t('form.date')} value={date} onChange={setDate} />
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t('form.completed')}</Text>
        <Switch
          value={completed}
          onValueChange={setCompleted}
          trackColor={{ true: colors.primary }}
        />
      </View>
      <Pressable
        onPress={add}
        disabled={!canAdd}
        style={({ pressed }) => [
          styles.button,
          !canAdd && styles.buttonDisabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.buttonText}>{t('form.add')}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles(c => ({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textSecondary,
  },
  button: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: c.primary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: c.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
}));
