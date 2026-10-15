import { useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  clearLogEntries,
  createLogger,
  getLogEntries,
  subscribeToLogs,
  type LogEntry,
  type LogLevel,
} from '../../observability/logger';
import {
  crashlyticsTestCrash,
  isFirebaseAvailable,
  trackEvent,
} from '../../observability/firebase';
import { isSentryEnabled, Sentry } from '../../observability/sentry';
import { SENTRY_DSN } from '../../observability/sentryConfig';
import i18n from '../../i18n';
import { makeStyles, useTheme, type ThemeColors } from '../../theme';

const log = createLogger('DebugScreen');

/** Theme token used for each log level's name. */
const LEVEL_COLORS: Record<LogLevel, keyof ThemeColors> = {
  debug: 'textMuted',
  info: 'info',
  warn: 'warning',
  error: 'danger',
};

const FILTERS: (LogLevel | 'all')[] = ['all', 'debug', 'info', 'warn', 'error'];

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/** Throws while rendering: caught by <AppErrorBoundary> in App.tsx. */
function BrokenComponent(): never {
  throw new Error('Render error test: BrokenComponent always throws');
}

type SentWhat = 'logs' | 'handledError' | 'message' | 'trace' | 'user';

function sentToast(whatKey: SentWhat, eventId?: string) {
  const what = i18n.t(`debug:toast.what.${whatKey}`);
  Toast.show({
    type: isSentryEnabled ? 'success' : 'info',
    text1: isSentryEnabled
      ? i18n.t('debug:toast.sent', { what })
      : i18n.t('debug:toast.sentryOff', { what }),
    text2: eventId ? i18n.t('debug:toast.eventId', { id: eventId }) : undefined,
  });
}

/**
 * Playground to see how errors, logs and traces reach Sentry and Firebase
 * (Crashlytics + Analytics), plus a log viewer with the latest lines written
 * by src/observability/logger.ts.
 */
export function SentryDebugScreen() {
  const insets = useSafeAreaInsets();
  const entries = useSyncExternalStore(subscribeToLogs, getLogEntries);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [renderBroken, setRenderBroken] = useState(false);
  const styles = useStyles();
  const { t } = useTranslation('debug');

  const visible = entries
    .filter(e => filter === 'all' || e.level === filter)
    .slice()
    .reverse();

  // Labels and hints: actions.<id>.label / .hint
  const actions: { id: string; onPress: () => void }[] = [
    {
      id: 'logs',
      onPress: () => {
        log.debug('Debug log test', { example: true });
        log.info('Info log test', { counter: entries.length });
        log.warn('Warning log test', { reason: 'just testing' });
        sentToast('logs');
      },
    },
    {
      id: 'handledError',
      onPress: () => {
        try {
          JSON.parse('{ not valid json');
        } catch (error) {
          const eventId = log.error('Handled error test', error, {
            input: '{ not valid json',
          });
          sentToast('handledError', eventId);
        }
      },
    },
    {
      id: 'message',
      onPress: () => {
        const eventId = Sentry.captureMessage(
          'Message test from the Debug screen',
          'info',
        );
        sentToast('message', eventId);
      },
    },
    {
      id: 'unhandledError',
      onPress: () => {
        log.info('About to throw an unhandled error');
        setTimeout(() => {
          throw new Error('Unhandled JS error test');
        });
      },
    },
    {
      id: 'unhandledRejection',
      onPress: () => {
        log.info('About to reject a promise without catch');
        Promise.reject(new Error('Unhandled promise rejection test'));
      },
    },
    {
      id: 'renderCrash',
      onPress: () => setRenderBroken(true),
    },
    {
      id: 'trace',
      onPress: async () => {
        await Sentry.startSpan(
          { name: 'Debug screen: fake checkout', op: 'task' },
          async () => {
            await Sentry.startSpan(
              { name: 'validate cart', op: 'function' },
              () => wait(150),
            );
            await Sentry.startSpan(
              { name: 'charge card', op: 'http.client' },
              () => wait(600),
            );
          },
        );
        log.info('Traced operation finished');
        sentToast('trace');
      },
    },
    {
      id: 'user',
      onPress: () => {
        Sentry.setUser({ id: 'demo-user-42' });
        log.info('Sentry user set', { userId: 'demo-user-42' });
        sentToast('user');
      },
    },
    {
      id: 'analytics',
      onPress: () => {
        trackEvent('debug_test_event', { source: 'debug_screen' });
        log.info('Analytics event sent', { name: 'debug_test_event' });
        Toast.show({
          type: isFirebaseAvailable() ? 'success' : 'info',
          text1: isFirebaseAvailable()
            ? t('toast.analyticsSent')
            : t('toast.firebaseUnavailable'),
          text2: t('toast.eventName', { name: 'debug_test_event' }),
        });
      },
    },
    {
      id: 'crashlytics',
      onPress: () =>
        Alert.alert(t('crashAlert.title'), t('crashAlert.crashlytics'), [
          { text: t('crashAlert.cancel'), style: 'cancel' },
          {
            text: t('crashAlert.crash'),
            style: 'destructive',
            onPress: () => {
              log.warn('Triggering a Crashlytics test crash');
              crashlyticsTestCrash();
            },
          },
        ]),
    },
    {
      id: 'nativeCrash',
      onPress: () =>
        Alert.alert(t('crashAlert.title'), t('crashAlert.sentry'), [
          { text: t('crashAlert.cancel'), style: 'cancel' },
          {
            text: t('crashAlert.crash'),
            style: 'destructive',
            onPress: () => {
              log.warn('Triggering a native crash');
              Sentry.nativeCrash();
            },
          },
        ]),
    },
  ];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      data={visible}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => <LogRow entry={item} />}
      ListEmptyComponent={<Text style={styles.empty}>{t('empty')}</Text>}
      ListHeaderComponent={
        <View>
          {renderBroken ? <BrokenComponent /> : null}

          <View style={styles.status}>
            <Text style={styles.statusTitle}>
              {isSentryEnabled
                ? t('status.sentryEnabled')
                : t('status.sentryDisabled')}
            </Text>
            <Text style={styles.statusText}>
              {SENTRY_DSN
                ? t('status.environment', {
                    env: __DEV__ ? 'development' : 'production',
                  })
                : t('status.noDsn')}
            </Text>
            <Text style={[styles.statusTitle, styles.statusSpacing]}>
              {isFirebaseAvailable()
                ? t('status.firebaseAvailable')
                : t('status.firebaseUnavailable')}
            </Text>
            <Text style={styles.statusText}>
              {isFirebaseAvailable()
                ? t('status.firebaseInfo')
                : t('status.firebaseSetup')}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>{t('tryIt')}</Text>
          {actions.map(action => (
            <Pressable
              key={action.id}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.action,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityHint={t(`actions.${action.id}.hint`)}
            >
              <Text style={styles.actionLabel}>
                {t(`actions.${action.id}.label`)}
              </Text>
              <Text style={styles.actionHint}>
                {t(`actions.${action.id}.hint`)}
              </Text>
            </Pressable>
          ))}

          <View style={styles.logsHeader}>
            <Text style={styles.sectionTitle}>
              {t('logsTitle', { total: entries.length })}
            </Text>
            <Pressable onPress={clearLogEntries} hitSlop={8}>
              <Text style={styles.clear}>{t('clear')}</Text>
            </Pressable>
          </View>
          <View style={styles.filters}>
            {FILTERS.map(f => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.chip, filter === f && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === f }}
              >
                <Text
                  style={[
                    styles.chipText,
                    filter === f && styles.chipTextActive,
                  ]}
                >
                  {/* Level names are technical: only "all" is translated. */}
                  {f === 'all' ? t('filterAll') : f}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
    />
  );
}

function LogRow({ entry }: { entry: LogEntry }) {
  const time = new Date(entry.timestamp).toISOString().slice(11, 23);
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation('debug');
  return (
    <View style={styles.row}>
      <Text style={styles.rowMeta}>
        {time}{' '}
        <Text style={{ color: colors[LEVEL_COLORS[entry.level]] }}>
          {entry.level.toUpperCase()}
        </Text>{' '}
        [{entry.scope}]
      </Text>
      <Text style={styles.rowMessage}>{entry.message}</Text>
      {entry.data ? (
        <Text style={styles.rowData} numberOfLines={4}>
          {safeJson(entry.data)}
        </Text>
      ) : null}
      {entry.eventId ? (
        <Text style={styles.rowEvent} selectable>
          {t('sentryEvent', { id: entry.eventId })}
        </Text>
      ) : null}
    </View>
  );
}

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

const useStyles = makeStyles(c => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  status: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
  statusSpacing: {
    marginTop: 12,
  },
  statusText: {
    marginTop: 4,
    fontSize: 13,
    color: c.textSecondary,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: c.textMuted,
    textTransform: 'uppercase',
  },
  action: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: c.surface,
  },
  pressed: {
    opacity: 0.6,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: c.primary,
  },
  actionHint: {
    marginTop: 2,
    fontSize: 12,
    color: c.textMuted,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginRight: 16,
  },
  clear: {
    color: c.danger,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: c.surfaceMuted,
  },
  chipActive: {
    backgroundColor: c.primary,
  },
  chipText: {
    fontSize: 12,
    color: c.textSecondary,
  },
  chipTextActive: {
    color: c.textOnPrimary,
  },
  empty: {
    margin: 16,
    color: c.textMuted,
  },
  row: {
    marginHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.borderStrong,
  },
  rowMeta: {
    fontSize: 11,
    color: c.textMuted,
    fontFamily: 'monospace',
  },
  rowMessage: {
    marginTop: 2,
    fontSize: 13,
    color: c.text,
  },
  rowData: {
    marginTop: 2,
    fontSize: 11,
    color: c.textSecondary,
    fontFamily: 'monospace',
  },
  rowEvent: {
    marginTop: 2,
    fontSize: 11,
    color: c.purple,
    fontFamily: 'monospace',
  },
}));
