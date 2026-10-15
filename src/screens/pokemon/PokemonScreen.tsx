import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchPokemonPage, type Pokemon } from './pokeApi';
import { PokemonRow } from './PokemonRow';
import { logRequestError } from '../../observability/http';
import { createLogger } from '../../observability/logger';
import i18n from '../../i18n';
import { makeStyles, useTheme } from '../../theme';

const log = createLogger('Pokemon');

const PAGE_SIZE = 20;

export function PokemonScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation('pokemon');
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (pageOffset: number) => {
    setError(null);
    try {
      const page = await fetchPokemonPage(pageOffset, PAGE_SIZE);
      setPokemon(page.pokemon);
      setTotal(page.total);
      setOffset(pageOffset);
      log.info('Page loaded', { offset: pageOffset, total: page.total });
    } catch (e) {
      logRequestError(log, 'Could not load page', e, { offset: pageOffset });
      setError(
        e instanceof Error ? e.message : i18n.t('pokemon:errors.unknown'),
      );
    }
  }, []);

  useEffect(() => {
    loadPage(0).finally(() => setInitialLoading(false));
  }, [loadPage]);

  // Pull to refresh replaces the list with the next 20 Pokémon.
  // When the end of the Pokédex is reached, it starts again from #1.
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const next = offset + PAGE_SIZE;
    await loadPage(total !== null && next >= total ? 0 : next);
    setRefreshing(false);
  }, [offset, total, loadPage]);

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.danger} />
      </View>
    );
  }

  if (error && pokemon.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => loadPage(offset)}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>
          {t('paged.showing', {
            from: offset + 1,
            to: offset + pokemon.length,
          })}
        </Text>
        <Text style={styles.bannerHint}>
          {error ? error : t('paged.hint', { size: PAGE_SIZE })}
        </Text>
      </View>
      <FlashList
        data={pokemon}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <PokemonRow pokemon={item} />}
        // A custom RefreshControl (instead of refreshing / onRefresh) so
        // the spinner follows the theme.
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.danger}
            colors={[colors.danger]}
            progressBackgroundColor={colors.surface}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      />
    </View>
  );
}

const useStyles = makeStyles(c => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: c.background,
  },
  banner: {
    padding: 12,
    backgroundColor: c.danger,
  },
  bannerTitle: {
    color: c.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  bannerHint: {
    color: c.textOnPrimary,
    opacity: 0.85,
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    fontSize: 15,
    color: c.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: c.danger,
  },
  retryText: {
    color: c.textOnPrimary,
    fontWeight: '600',
  },
}));
