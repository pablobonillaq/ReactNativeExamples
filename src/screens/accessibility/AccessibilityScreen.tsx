import { useHeaderHeight } from '@react-navigation/elements';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  findNodeHandle,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type TextInputInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { DateField } from '../../components/form/DateField';
import { TextField } from '../../components/form/TextField';
import { currentLocale } from '../../i18n';
import { makeStyles } from '../../theme';

const IMAGE_URL = 'https://picsum.photos/seed/accessibility/800/500';

// Placeholder text (Latin filler): the same in every language.
const LOREM_IPSUM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod ' +
  'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim ' +
  'veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea ' +
  'commodo consequat.';

const SCREEN_READER = Platform.OS === 'ios' ? 'VoiceOver' : 'TalkBack';

function formatDate(date: Date) {
  return date.toLocaleDateString(currentLocale(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Accessibility demo. Turn on VoiceOver (iOS) or TalkBack (Android) and swipe
 * through the screen: every element announces a label (what it is), a role
 * (header, image, button, text field...) and, for interactive elements, a
 * hint (what happens when you activate it).
 */
export function AccessibilityScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const screenReaderOn = useScreenReaderEnabled();
  const styles = useStyles();
  const { t } = useTranslation('accessibility');

  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ name?: string; date?: string }>({});
  const nameRef = useRef<TextInputInstance>(null);
  const titleRef = useRef<ComponentRef<typeof Text>>(null);

  // Move the screen reader focus to the header when the screen opens, so it
  // starts reading from the top instead of the back button.
  useEffect(() => {
    const timer = setTimeout(() => {
      const node = findNodeHandle(titleRef.current);
      if (node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const submit = () => {
    const next = {
      name: name.trim() ? undefined : t('errors.nameRequired'),
      date: date ? undefined : t('errors.dateRequired'),
    };
    setErrors(next);

    if (next.name || next.date) {
      // Errors also announce themselves (role "alert" / live region); this
      // gives a short summary and moves focus to the first invalid field.
      const count = [next.name, next.date].filter(Boolean).length;
      AccessibilityInfo.announceForAccessibility(
        t('errors.announce', { count }),
      );
      if (next.name) {
        nameRef.current?.focus();
      }
      return;
    }

    const message = t('submitted.message', {
      name: name.trim(),
      date: formatDate(date!),
    });
    Toast.show({
      type: 'success',
      text1: t('submitted.title'),
      text2: message,
    });
    // Toasts are visual only: read the result out loud too.
    AccessibilityInfo.announceForAccessibility(
      t('submitted.announce', { message }),
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Grouped with `accessible`: read as one element instead of two. */}
        <View
          accessible
          accessibilityLabel={
            screenReaderOn
              ? t('status.a11yOn', { reader: SCREEN_READER })
              : t('status.a11yOff', { reader: SCREEN_READER })
          }
          style={[styles.status, screenReaderOn && styles.statusOn]}
        >
          <Text style={styles.statusIcon}>{screenReaderOn ? '🔊' : '🔇'}</Text>
          <Text style={styles.statusText}>
            {screenReaderOn
              ? t('status.on', { reader: SCREEN_READER })
              : t('status.off', { reader: SCREEN_READER })}
          </Text>
        </View>

        <Text ref={titleRef} style={styles.title} accessibilityRole="header">
          {t('title')}
        </Text>

        <Image
          source={{ uri: IMAGE_URL }}
          style={styles.image}
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('imageLabel')}
        />

        <Text style={styles.paragraph} accessibilityRole="text">
          {LOREM_IPSUM}
        </Text>

        <TextField
          ref={nameRef}
          label={t('name.label')}
          icon="👤"
          value={name}
          onChangeText={text => {
            setName(text);
            if (errors.name) {
              setErrors(e => ({ ...e, name: undefined }));
            }
          }}
          placeholder={t('name.placeholder')}
          autoCapitalize="words"
          autoComplete="name"
          error={errors.name}
          accessibilityLabel={t('name.label')}
          accessibilityHint={t('name.hint')}
        />

        <DateField
          label={t('date.label')}
          value={date}
          onChange={d => {
            setDate(d);
            setErrors(e => ({ ...e, date: undefined }));
          }}
          error={errors.date}
          accessibilityLabel={t('date.label')}
          accessibilityHint={t('date.hint')}
        />

        <Pressable
          onPress={submit}
          accessibilityRole="button"
          accessibilityLabel={t('submit.label')}
          accessibilityHint={t('submit.hint')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{t('submit.label')}</Text>
        </Pressable>

        <View style={styles.tips} accessibilityRole="summary">
          <Text style={styles.tipsTitle} accessibilityRole="header">
            {t('tips.title')}
          </Text>
          <Text style={styles.tip}>{t('tips.ios')}</Text>
          <Text style={styles.tip}>{t('tips.android')}</Text>
          <Text style={styles.tip}>{t('tips.errors')}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Whether VoiceOver / TalkBack is running, kept up to date. */
function useScreenReaderEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setEnabled);
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setEnabled,
    );
    return () => subscription.remove();
  }, []);
  return enabled;
}

const useStyles = makeStyles(c => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: c.surfaceMuted,
  },
  statusOn: {
    backgroundColor: c.successSoft,
  },
  statusIcon: {
    fontSize: 18,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: c.textSecondary,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: c.text,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 12,
    backgroundColor: c.surfaceMuted,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: c.textSecondary,
  },
  button: {
    width: '100%',
    // 48dp minimum touch target recommended by both platforms.
    minHeight: 48,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  tips: {
    gap: 6,
    padding: 14,
    borderRadius: 10,
    backgroundColor: c.surface,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
  },
  tip: {
    fontSize: 13,
    lineHeight: 19,
    color: c.textSecondary,
  },
}));
