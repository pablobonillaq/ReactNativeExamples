import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  copyImage,
  copyText,
  getLocalImage,
  readClipboard,
  shareImage,
  shareText,
  SHARE_IMAGE_URL,
  type ClipboardContent,
} from './shareActions';
import { logRequestError } from '../../observability/http';
import { createLogger } from '../../observability/logger';
import { makeStyles, useTheme } from '../../theme';

const log = createLogger('Share');

// Placeholder text (Latin): the same in every language.
const LOREM_IPSUM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod ' +
  'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim ' +
  'veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea ' +
  'commodo consequat.';

/**
 * Share and Copy demo. "Share" opens the system share sheet with the apps
 * installed on the device that accept that content; "Copy" puts the text or
 * the image on the clipboard so it can be pasted in another app.
 */
export function ShareScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t } = useTranslation('share');
  const [busy, setBusy] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<ClipboardContent | null>(null);

  // Start downloading the image right away so Share/Copy are instant.
  useEffect(() => {
    getLocalImage().catch(error =>
      logRequestError(log, 'Could not pre-download the image', error),
    );
  }, []);

  const run = async (
    key: string,
    action: () => Promise<void>,
    done?: string,
  ) => {
    setBusy(key);
    log.info(`Action: ${key}`);
    try {
      await action();
      log.info(`Action done: ${key}`);
      if (done) {
        Toast.show({ type: 'success', text1: done });
      }
    } catch (error) {
      log.error(`Action failed: ${key}`, error, { platformAction: key });
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setBusy(null);
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
      <Section
        title={t('text.title')}
        actions={
          <>
            <ActionButton
              icon="📤"
              label={t('actions.share')}
              busy={busy === 'share-text'}
              onPress={() => run('share-text', () => shareText(LOREM_IPSUM))}
              hint={t('text.shareHint')}
            />
            <ActionButton
              icon="📋"
              label={t('actions.copy')}
              busy={busy === 'copy-text'}
              onPress={() =>
                run(
                  'copy-text',
                  async () => copyText(LOREM_IPSUM),
                  t('text.copied'),
                )
              }
              hint={t('text.copyHint')}
            />
          </>
        }
      >
        <Text style={styles.text} selectable>
          {LOREM_IPSUM}
        </Text>
      </Section>

      <Section
        title={t('image.title')}
        actions={
          <>
            <ActionButton
              icon="📤"
              label={t('actions.share')}
              busy={busy === 'share-image'}
              onPress={() => run('share-image', shareImage)}
              hint={t('image.shareHint')}
            />
            <ActionButton
              icon="📋"
              label={t('actions.copy')}
              busy={busy === 'copy-image'}
              onPress={() => run('copy-image', copyImage, t('image.copied'))}
              hint={t('image.copyHint')}
            />
          </>
        }
      >
        <Image
          source={{ uri: SHARE_IMAGE_URL }}
          style={styles.image}
          accessibilityLabel={t('image.a11y')}
        />
      </Section>

      <Section
        title={t('clipboard.title')}
        actions={
          <ActionButton
            icon="📥"
            label={t('actions.paste')}
            busy={busy === 'paste'}
            onPress={() =>
              run('paste', async () => setClipboard(await readClipboard()))
            }
            hint={t('clipboard.pasteHint')}
          />
        }
      >
        {clipboard === null ? (
          <Text style={styles.placeholder}>{t('clipboard.placeholder')}</Text>
        ) : clipboard.type === 'image' ? (
          <Image
            source={{ uri: clipboard.uri }}
            style={styles.image}
            accessibilityLabel={t('clipboard.imageA11y')}
          />
        ) : clipboard.type === 'text' ? (
          <Text style={styles.text} numberOfLines={6}>
            {clipboard.text}
          </Text>
        ) : (
          <Text style={styles.placeholder}>{t('clipboard.empty')}</Text>
        )}
      </Section>

      <Text style={styles.tip}>{t('tip')}</Text>
    </ScrollView>
  );
}

function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions: ReactNode;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.row}>
        <View style={styles.body}>{children}</View>
        <View style={styles.actions}>{actions}</View>
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  busy,
  hint,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  busy: boolean;
  hint: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ busy }}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      {busy ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text style={styles.actionIcon}>{icon}</Text>
      )}
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
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
    padding: 16,
    borderRadius: 16,
    backgroundColor: c.surface,
    borderWidth: theme.isDark ? 1 : 0,
    borderColor: c.border,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: c.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  body: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: c.text,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 10,
    backgroundColor: c.surfaceMuted,
  },
  actions: {
    gap: 10,
  },
  action: {
    width: 68,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
    backgroundColor: c.surfaceAlt,
  },
  pressed: {
    opacity: 0.7,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: c.primary,
  },
  placeholder: {
    fontSize: 14,
    lineHeight: 20,
    color: c.placeholder,
  },
  tip: {
    fontSize: 13,
    lineHeight: 19,
    color: c.textMuted,
  },
}));
