import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../theme';
import { useLastErrorReport } from './errorReports';
import { describeError } from './logger';

/**
 * Shown by AppErrorBoundary (react-native-error-boundary) when a component
 * throws while rendering. Without it, a render error leaves a blank screen
 * in release builds. The error has been sent to Sentry (find it with the
 * event id: sentry.io → Issues → search "id:<event id>") and to Firebase
 * Crashlytics as a non-fatal error.
 */
export function ErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  const report = useLastErrorReport();
  const styles = useStyles();
  const { t } = useTranslation('errors');

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title} accessibilityRole="header">
        {t('title')}
      </Text>
      <Text style={styles.message}>{describeError(error)}</Text>
      <Text style={styles.reported}>{t('reported')}</Text>
      {report?.sentryEventId ? (
        <Text style={styles.eventId} selectable>
          {t('sentryEvent', { id: report.sentryEventId })}
        </Text>
      ) : null}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={resetError}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{t('tryAgain')}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles(c => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: c.background,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: c.textSecondary,
    textAlign: 'center',
  },
  reported: {
    marginTop: 12,
    fontSize: 12,
    color: c.textMuted,
  },
  eventId: {
    marginTop: 4,
    fontSize: 12,
    color: c.textMuted,
    fontFamily: 'monospace',
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: c.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: c.textOnPrimary,
    fontWeight: '600',
  },
}));
