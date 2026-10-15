import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { LEAVE_COMMENT_URL } from '../../navigation/linking';
import { createLogger } from '../../observability/logger';
import { makeStyles } from '../../theme';

const log = createLogger('DeepLinkDemo');

const ADB_COMMAND = `adb shell am start -W -a android.intent.action.VIEW -d "${LEAVE_COMMENT_URL}" com.reactnativeexamples`;
const SIMCTL_COMMAND = `xcrun simctl openurl booted "${LEAVE_COMMENT_URL}"`;

/**
 * Deep linking demo. The button doesn't navigate directly: it asks the OS to
 * open a URL with the app's custom scheme. The OS hands the URL back to the
 * app (the same path an external link would take) and React Navigation maps
 * it to a screen using the `linking` config in src/navigation/linking.ts.
 */
export function DeepLinkDemoScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t } = useTranslation('deepLink');

  const openDeepLink = async () => {
    log.info('Opening deep link', { url: LEAVE_COMMENT_URL });
    try {
      await Linking.openURL(LEAVE_COMMENT_URL);
    } catch (error) {
      // Usually the scheme isn't registered yet: a setup issue, not a bug.
      log.warn(
        'Could not open the deep link',
        { url: LEAVE_COMMENT_URL },
        error,
      );
      Toast.show({
        type: 'error',
        text1: t('openError.title'),
        text2: t('openError.message'),
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.emoji}>🔗</Text>
        <Text style={styles.title}>{t('title')}</Text>
        <Text style={styles.description}>{t('description')}</Text>

        <Text style={styles.label}>{t('urlLabel')}</Text>
        <Text style={styles.code} selectable>
          {LEAVE_COMMENT_URL}
        </Text>

        <Pressable
          onPress={openDeepLink}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{t('button')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>{t('outside.title')}</Text>
        <Text style={styles.description}>{t('outside.description')}</Text>
        <Text style={styles.label}>{t('outside.android')}</Text>
        <Text style={styles.code} selectable>
          {ADB_COMMAND}
        </Text>
        <Text style={styles.label}>{t('outside.ios')}</Text>
        <Text style={styles.code} selectable>
          {SIMCTL_COMMAND}
        </Text>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((c, theme) => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    gap: 10,
    padding: 20,
    borderRadius: 16,
    backgroundColor: c.surface,
    shadowColor: c.shadow,
    shadowOpacity: theme.isDark ? 0 : 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: theme.isDark ? 0 : 2,
    borderWidth: theme.isDark ? 1 : 0,
    borderColor: c.border,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: c.text,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '700',
    color: c.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: c.textSecondary,
  },
  label: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: c.textMuted,
  },
  code: {
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
    fontFamily: 'monospace',
    fontSize: 12,
    color: c.codeText,
    backgroundColor: c.codeBackground,
  },
  button: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: c.primary,
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
