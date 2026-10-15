import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextField } from '../../../components/form/TextField';
import { createAddTodoForm } from '../AddTodoForm';
import { createTodoList } from '../TodoList';
import { makeStyles } from '../../../theme';
import { TodoScreenLayout } from '../TodoScreenLayout';
import {
  clearNativeTodos,
  loadNativeTodos,
  setNativeTodoQuery,
  useNativeTodos,
  useNativeTodosState,
  type NativeCall,
} from './todoNativeStore';

// The same form and list as the other todo screens, bound to the native store.
const AddTodoForm = createAddTodoForm(useNativeTodos);
const TodoList = createTodoList(useNativeTodos);

const STORAGE = Platform.select({
  ios: 'NSUserDefaults',
  default: 'SharedPreferences',
});

/**
 * Todo list whose data lives in native code: a Turbo Native Module written in
 * Kotlin (Android) and Objective-C++ (iOS), described by specs/NativeTodos.ts.
 */
export function TodoNativeScreen() {
  const { t } = useTranslation('todo');
  const { available } = useNativeTodosState();

  useEffect(() => {
    loadNativeTodos();
  }, []);

  return (
    <TodoScreenLayout caption={t('captions.native', { storage: STORAGE })}>
      {available ? (
        <>
          <InfoCard />
          <AddTodoForm />
          <SearchBar />
          <Results />
          <CallLog />
        </>
      ) : (
        <NotAvailable />
      )}
    </TodoScreenLayout>
  );
}

/** What getInfo() (a sync native call) returned, plus how the call flows. */
function InfoCard() {
  const { t } = useTranslation('todo');
  const styles = useStyles();
  const { info, total } = useNativeTodosState();
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t('native.info.title')}</Text>
      <Text style={styles.text}>
        {t('native.info.flow', {
          file:
            Platform.OS === 'ios'
              ? 'RCTNativeTodos.mm'
              : 'NativeTodosModule.kt',
          storage: STORAGE,
        })}
      </Text>
      {info ? (
        <View style={styles.infoRows}>
          <InfoRow label={t('native.info.platform')} value={info.platform} />
          <InfoRow label={t('native.info.storage')} value={info.storage} />
          <InfoRow label={t('native.info.key')} value={info.key} />
          <InfoRow
            label="count()"
            value={t('native.info.saved', { count: total })}
          />
        </View>
      ) : null}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <Text style={styles.mono}>
      <Text style={styles.monoLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

/** Every change runs the native search(query); it ignores case and accents. */
function SearchBar() {
  const { t } = useTranslation('todo');
  const styles = useStyles();
  const { query, todos, total } = useNativeTodosState();
  return (
    <View style={styles.card}>
      <TextField
        label={t('native.search.label')}
        icon="🔍"
        value={query}
        onChangeText={setNativeTodoQuery}
        placeholder={t('native.search.placeholder')}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {query.trim() ? (
        <View style={styles.searchFooter}>
          <Text style={styles.muted}>
            {t('native.search.matches', {
              shown: todos.length,
              total,
              query: query.trim(),
            })}
          </Text>
          <Pressable onPress={() => setNativeTodoQuery('')} hitSlop={8}>
            <Text style={styles.link}>{t('native.search.clear')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Results() {
  const { t } = useTranslation('todo');
  const styles = useStyles();
  const { query, todos, loaded } = useNativeTodosState();
  if (!loaded) {
    return <Text style={styles.muted}>{t('native.loading')}</Text>;
  }
  if (query.trim() && todos.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.text}>
          {t('native.search.noResults', { query: query.trim() })}
        </Text>
      </View>
    );
  }
  return <TodoList />;
}

/** The last calls that crossed from JS to native, newest first. */
function CallLog() {
  const { t } = useTranslation('todo');
  const styles = useStyles();
  const { calls, total } = useNativeTodosState();
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t('native.calls.title')}</Text>
      <Text style={styles.muted}>{t('native.calls.legend')}</Text>
      {calls.map(call => (
        <CallRow key={call.id} call={call} />
      ))}
      {total > 0 ? (
        <Pressable
          onPress={clearNativeTodos}
          style={({ pressed }) => [styles.danger, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.dangerText}>{t('native.calls.deleteAll')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CallRow({ call }: { call: NativeCall }) {
  const { t } = useTranslation('todo');
  const styles = useStyles();
  return (
    <View style={styles.callRow}>
      <Text style={[styles.mono, call.failed && styles.failed]}>
        {call.method}({call.args}) → {call.result}
      </Text>
      <Text style={styles.callMeta}>
        {t('native.calls.meta', {
          mode: call.sync ? 'sync' : 'async',
          ms: call.ms.toFixed(2),
        })}
      </Text>
    </View>
  );
}

/** Shown when TurboModuleRegistry.get('NativeTodos') returned null. */
function NotAvailable() {
  const { t } = useTranslation('todo');
  const styles = useStyles();
  return (
    <View style={[styles.card, styles.warning]}>
      <Text style={styles.cardTitle}>{t('native.notAvailable.title')}</Text>
      <Text style={styles.text}>{t('native.notAvailable.body')}</Text>
      <Text style={styles.mono}>
        {Platform.OS === 'ios'
          ? 'cd ios; pod install; cd ..; npm run ios'
          : 'npm run android'}
      </Text>
    </View>
  );
}

const useStyles = makeStyles(c => ({
  card: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  warning: {
    borderWidth: 1,
    borderColor: c.warning,
    backgroundColor: c.warningSoft,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
  },
  text: {
    fontSize: 13,
    color: c.textSecondary,
  },
  muted: {
    fontSize: 12,
    color: c.textMuted,
  },
  infoRows: {
    gap: 2,
  },
  mono: {
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    color: c.text,
  },
  monoLabel: {
    color: c.primary,
    fontWeight: '700',
  },
  searchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    color: c.primary,
  },
  callRow: {
    gap: 2,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
  },
  callMeta: {
    fontSize: 11,
    color: c.textMuted,
  },
  failed: {
    color: c.danger,
  },
  danger: {
    marginTop: 4,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.danger,
  },
  dangerText: {
    fontWeight: '600',
    color: c.danger,
  },
  pressed: {
    opacity: 0.7,
  },
}));
