import { CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXAMPLES } from '../navigation/examples';
import type { RootStackScreenProps } from '../navigation/types';
import { makeStyles } from '../theme';

export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  // Titles and descriptions come from the 'navigation' namespace; the list
  // re-renders when the language changes.
  const { t } = useTranslation('navigation');

  return (
    <FlatList
      style={styles.list}
      data={EXAMPLES}
      keyExtractor={route => route}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 16 },
      ]}
      ItemSeparatorComponent={Separator}
      renderItem={({ item: route, index }) => (
        <Pressable
          // navigate() can't type-check a union of route names (each has
          // its own params). Every menu route opens without params, so the
          // untyped action is safe here.
          onPress={() => navigation.dispatch(CommonActions.navigate(route))}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={t('home:a11yItem', {
            number: index + 1,
            title: t(`menu.${route}.title`),
          })}
          accessibilityHint={t(`menu.${route}.description`)}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{index + 1}</Text>
          </View>
          <View style={styles.texts}>
            <Text style={styles.title}>{t(`menu.${route}.title`)}</Text>
            <Text style={styles.description}>
              {t(`menu.${route}.description`)}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
    />
  );
}

function Separator() {
  const styles = useStyles();
  return <View style={styles.separator} />;
}

const useStyles = makeStyles((c, theme) => ({
  list: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: c.surface,
    shadowColor: c.shadow,
    shadowOpacity: theme.isDark ? 0 : 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: theme.isDark ? 0 : 2,
    borderWidth: theme.isDark ? 1 : 0,
    borderColor: c.border,
  },
  pressed: {
    opacity: 0.7,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: c.textOnPrimary,
    fontWeight: '700',
  },
  texts: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: c.text,
  },
  description: {
    marginTop: 2,
    fontSize: 13,
    color: c.textMuted,
  },
  chevron: {
    fontSize: 28,
    color: c.placeholder,
    marginLeft: 8,
  },
  separator: {
    height: 12,
  },
}));
