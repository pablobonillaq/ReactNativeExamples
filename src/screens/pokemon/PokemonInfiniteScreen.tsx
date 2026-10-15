import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchPokemonPage, type Pokemon } from './pokeApi';
import { PokemonRow } from './PokemonRow';
import { logRequestError } from '../../observability/http';
import { createLogger } from '../../observability/logger';
import i18n from '../../i18n';
import { makeStyles, useTheme } from '../../theme';

const log = createLogger('PokemonInfinite');

const PAGE_SIZE = 25;

export function PokemonInfiniteScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation('pokemon');
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // onEndReached can fire several times in a row; the ref blocks
  // duplicate requests before the `loading` state has re-rendered.
  const loadingRef = useRef(false);

  const hasMore = total === null || pokemon.length < total;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) {
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchPokemonPage(pokemon.length, PAGE_SIZE);
      setPokemon(current => [...current, ...page.pokemon]);
      setTotal(page.total);
      log.info('Loaded more', {
        loaded: pokemon.length + page.pokemon.length,
        total: page.total,
      });
    } catch (e) {
      logRequestError(log, 'Could not load more', e, {
        offset: pokemon.length,
      });
      setError(
        e instanceof Error ? e.message : i18n.t('pokemon:errors.unknown'),
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [pokemon.length, hasMore]);

  useEffect(() => {
    loadMore();
    // Only the first page is loaded on mount; the rest via onEndReached.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pokemon.length === 0) {
    return (
      <View style={styles.center}>
        {error ? (
          <>
            <Text style={styles.errorText}>{error}</Text>
            <RetryButton onPress={loadMore} />
          </>
        ) : (
          <ActivityIndicator size="large" color={colors.info} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>
          {total !== null
            ? t('infinite.loadedOf', { loaded: pokemon.length, total })
            : t('infinite.loaded', { loaded: pokemon.length })}
        </Text>
        <Text style={styles.bannerHint}>
          {t('infinite.hint', { size: PAGE_SIZE })}
        </Text>
      </View>
      <FlashList
        data={pokemon}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <PokemonRow pokemon={item} />}
        onEndReached={error ? undefined : loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        ListFooterComponent={
          <View style={styles.footer}>
            {loading ? (
              <ActivityIndicator color={colors.info} />
            ) : error ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <RetryButton onPress={loadMore} />
              </>
            ) : !hasMore ? (
              <Text style={styles.endText}>{t('infinite.end')}</Text>
            ) : null}
          </View>
        }
      />
    </View>
  );
}

function RetryButton({ onPress }: { onPress: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation('pokemon');
  return (
    <Pressable style={styles.retryButton} onPress={onPress}>
      <Text style={styles.retryText}>{t('retry')}</Text>
    </Pressable>
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
    backgroundColor: c.info,
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
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endText: {
    fontSize: 14,
    color: c.textMuted,
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
    backgroundColor: c.info,
  },
  retryText: {
    color: c.textOnPrimary,
    fontWeight: '600',
  },
}));
