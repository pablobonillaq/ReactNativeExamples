import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavDetailParams } from '../../navigation/types';
import { makeStyles } from '../../theme';

/**
 * Shared destination of the navigation demo. It is registered in the root
 * stack (opened from the drawer and the tabs) and in the demo stack, and
 * everything it shows comes from the navigation params.
 *
 * The texts in the params are already translated when they are built
 * (detailParams.ts). The header title is set from the params where the
 * screen is registered:
 *   options={({ route }) => ({ title: route.params.headerTitle })}
 */
export function NavDetailScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t } = useTranslation('navigationDemo');
  const { params } =
    useRoute<RouteProp<Record<string, NavDetailParams>, string>>();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <Image source={{ uri: params.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.badge}>
          {t('detail.openedFrom', { source: params.source })}
        </Text>
        <Text style={styles.title}>{params.title}</Text>
        <Text style={styles.text}>{params.text}</Text>

        <Text style={styles.paramsLabel}>{t('detail.paramsLabel')}</Text>
        <View style={styles.paramsBox}>
          <Text style={styles.paramsText}>
            {JSON.stringify(
              { ...params, text: `${params.text.slice(0, 40)}…` },
              null,
              2,
            )}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles(c => ({
  container: {
    flex: 1,
    backgroundColor: c.surface,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: c.surfaceMuted,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '600',
    color: c.primary,
    backgroundColor: c.primarySoft,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: c.text,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: c.textSecondary,
  },
  paramsLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: c.textMuted,
  },
  paramsBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: c.codeBackground,
  },
  paramsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: c.codeText,
  },
}));
