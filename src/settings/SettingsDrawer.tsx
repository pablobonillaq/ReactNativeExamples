import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LANGUAGES, type Language } from '../i18n/languages';
import { makeStyles, useTheme } from '../theme';
import {
  setLanguage,
  setThemePreference,
  THEME_PREFERENCES,
  useSettings,
  type ThemePreference,
} from './settingsStore';

/**
 * Drawer (side menu) with the app settings: language and theme.
 *
 * It wraps the whole stack navigator (App.tsx). Open it with the ☰ button
 * in the home header, the ⚙️ button in the other headers, or by swiping from
 * the left edge on the home screen.
 */

type DrawerControls = {
  openDrawer: () => void;
  closeDrawer: () => void;
};

const SettingsDrawerContext = createContext<DrawerControls>({
  openDrawer: () => {},
  closeDrawer: () => {},
});

export function useSettingsDrawer() {
  return useContext(SettingsDrawerContext);
}

export function SettingsDrawerLayout({
  children,
  swipeEnabled,
  onGoHome,
}: {
  children: ReactNode;
  /** Edge swipe only on the home screen: other screens use horizontal gestures. */
  swipeEnabled: boolean;
  onGoHome: () => void;
}) {
  const [open, setOpen] = useState(false);
  const styles = useStyles();

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const controls = useMemo(
    () => ({ openDrawer, closeDrawer }),
    [openDrawer, closeDrawer],
  );

  return (
    <Drawer
      open={open}
      onOpen={openDrawer}
      onClose={closeDrawer}
      swipeEnabled={swipeEnabled || open}
      drawerType="front"
      drawerStyle={styles.drawer}
      overlayStyle={styles.overlay}
      renderDrawerContent={() => (
        <SettingsDrawerContent
          onGoHome={() => {
            closeDrawer();
            onGoHome();
          }}
        />
      )}
    >
      <SettingsDrawerContext.Provider value={controls}>
        {children}
      </SettingsDrawerContext.Provider>
    </Drawer>
  );
}

function SettingsDrawerContent({ onGoHome }: { onGoHome: () => void }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('settings');
  const { language, themePreference } = useSettings();
  const { scheme } = useTheme();

  const themeLabel = (preference: ThemePreference) =>
    preference === 'system'
      ? t('theme.systemCurrent', { scheme: t(`schemes.${scheme}`) })
      : t(`theme.${preference}`);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <Text style={styles.title} accessibilityRole="header">
        {t('title')}
      </Text>
      <Text style={styles.subtitle}>{t('subtitle')}</Text>

      <Section
        title={t('language.title')}
        description={t('language.description')}
      >
        {LANGUAGES.map((option: Language) => (
          <Option
            key={option}
            label={t(`language.${option}`)}
            selected={language === option}
            onPress={() => setLanguage(option)}
          />
        ))}
      </Section>

      <Section title={t('theme.title')} description={t('theme.description')}>
        {THEME_PREFERENCES.map(option => (
          <Option
            key={option}
            label={themeLabel(option)}
            icon={THEME_ICONS[option]}
            selected={themePreference === option}
            onPress={() => setThemePreference(option)}
          />
        ))}
      </Section>

      <Pressable
        onPress={onGoHome}
        style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <Text style={styles.homeButtonText}>☰ {t('goHome')}</Text>
      </Pressable>

      <Text style={styles.footer}>{t('footer')}</Text>
    </ScrollView>
  );
}

const THEME_ICONS: Record<ThemePreference, string> = {
  system: '📱',
  light: '☀️',
  dark: '🌙',
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.section} accessibilityRole="radiogroup">
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.options}>{children}</View>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );
}

function Option({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.pressed,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      {icon ? <Text style={styles.optionIcon}>{icon}</Text> : null}
      <Text
        style={[styles.optionLabel, selected && styles.optionLabelSelected]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** ☰ / ⚙️ header button that opens the settings drawer. */
export function SettingsHeaderButton({ icon }: { icon: '☰' | '⚙️' }) {
  const { openDrawer } = useSettingsDrawer();
  const { t } = useTranslation('common');
  const styles = useStyles();
  return (
    <Pressable
      onPress={openDrawer}
      hitSlop={10}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.openSettings')}
      accessibilityHint={t('a11y.openSettingsHint')}
    >
      <Text style={styles.headerButtonText}>{icon}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles(c => ({
  drawer: {
    width: 300,
    backgroundColor: c.surface,
  },
  overlay: {
    backgroundColor: c.overlay,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: c.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: c.textMuted,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 12,
    color: c.textMuted,
  },
  options: {
    gap: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: c.background,
    borderWidth: 1,
    borderColor: c.border,
  },
  optionSelected: {
    backgroundColor: c.primarySoft,
    borderColor: c.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: c.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: c.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: c.primary,
  },
  optionIcon: {
    fontSize: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: c.text,
  },
  optionLabelSelected: {
    fontWeight: '700',
  },
  homeButton: {
    marginTop: 28,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: c.primary,
  },
  homeButtonText: {
    color: c.textOnPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  footer: {
    marginTop: 16,
    fontSize: 12,
    color: c.textMuted,
  },
  headerButton: {
    paddingHorizontal: 4,
  },
  headerButtonText: {
    fontSize: 20,
    color: c.text,
  },
}));
