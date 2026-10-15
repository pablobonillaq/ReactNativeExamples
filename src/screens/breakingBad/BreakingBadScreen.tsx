import { FlashList } from '@shopify/flash-list';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../navigation/types';
import {
  errorMessage,
  getAllDeaths,
  getCharacters,
  hasValue,
  isDeathOf,
  type Character,
  type Death,
  type Series,
} from './breakingBadApi';
import { makeBreakingBadStyles, SeriesBadge, useBreakingBadColors } from './ui';
import { logRequestError } from '../../observability/http';
import { createLogger } from '../../observability/logger';

const log = createLogger('BreakingBad');

type Filter = 'All' | Series;
const FILTERS: Filter[] = ['All', 'Breaking Bad', 'Better Call Saul'];

export function BreakingBadScreen({
  navigation,
}: RootStackScreenProps<'BreakingBad'>) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const bb = useBreakingBadColors();
  const { t } = useTranslation('breakingBad');
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [deaths, setDeaths] = useState<Death[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // The series filter is sent to the API as ?category=...; the search box
  // filters locally. AbortController cancels the request if the filter
  // changes (or the screen closes) before it finishes.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getCharacters(filter === 'All' ? undefined : filter, controller.signal)
      .then(result => {
        log.info('Characters loaded', { filter, count: result.length });
        setCharacters(result);
      })
      .catch(e => {
        logRequestError(log, 'Could not load characters', e, { filter });
        if (!controller.signal.aborted) {
          setError(errorMessage(e));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [filter, reloadKey]);

  // Deaths are only used for the "Deceased" badge, so a failure is ignored.
  useEffect(() => {
    getAllDeaths()
      .then(setDeaths)
      .catch(e => logRequestError(log, 'Could not load deaths', e));
  }, []);

  const deceasedIds = useMemo(
    () =>
      new Set(
        characters
          .filter(c => deaths.some(d => isDeathOf(d, c)))
          .map(c => c.id),
      ),
    [characters, deaths],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return characters;
    }
    return characters.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.portrayed.toLowerCase().includes(query) ||
        (hasValue(c.nickname) && c.nickname.toLowerCase().includes(query)),
    );
  }, [characters, search]);

  // The header follows the Breaking Bad palette of the current theme.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: bb.surface },
      headerTintColor: bb.text,
    });
  }, [navigation, bb]);

  const openCharacter = useCallback(
    (character: Character) =>
      navigation.navigate('BreakingBadCharacter', {
        id: character.id,
        name: character.name,
      }),
    [navigation],
  );

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('list.searchPlaceholder')}
          placeholderTextColor={bb.muted}
          style={styles.search}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        <View style={styles.filters}>
          {FILTERS.map(option => {
            const selected = option === filter;
            return (
              <Pressable
                key={option}
                onPress={() => setFilter(option)}
                style={[styles.filter, selected && styles.filterSelected]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {/* Series names are proper nouns; only "All" is translated. */}
                  {option === 'All' ? t('list.filterAll') : option}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {!loading && !error ? (
          <Text style={styles.count}>
            {t('list.count', {
              visible: visible.length,
              total: characters.length,
            })}
          </Text>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={bb.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => setReloadKey(k => k + 1)}
          >
            <Text style={styles.retryText}>{t('retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={visible}
          numColumns={2}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{
            ...styles.listContent,
            paddingBottom: insets.bottom + 6,
          }}
          renderItem={({ item }) => (
            <CharacterCard
              character={item}
              deceased={deceasedIds.has(item.id)}
              onPress={openCharacter}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('list.empty', { search })}</Text>
          }
        />
      )}
    </View>
  );
}

function CharacterCard({
  character,
  deceased,
  onPress,
}: {
  character: Character;
  deceased: boolean;
  onPress: (character: Character) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation('breakingBad');
  return (
    <Pressable
      onPress={() => onPress(character)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image source={{ uri: character.img }} style={styles.image} />
      {deceased ? (
        <View style={styles.deceased}>
          <Text style={styles.deceasedText}>{t('deceased')}</Text>
        </View>
      ) : null}
      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={1}>
          {character.name}
        </Text>
        {hasValue(character.nickname) ? (
          <Text style={styles.nickname} numberOfLines={1}>
            “{character.nickname}”
          </Text>
        ) : null}
        <Text style={styles.portrayed} numberOfLines={1}>
          {character.portrayed}
        </Text>
        <View style={styles.cardFooter}>
          <SeriesBadge series={character.category} />
          <Text style={styles.episodes}>
            {t('list.episodes', { episodes: character.episodes_count })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const useStyles = makeBreakingBadStyles(bb => ({
  container: {
    flex: 1,
    backgroundColor: bb.background,
  },
  controls: {
    padding: 12,
    gap: 10,
    backgroundColor: bb.surface,
  },
  search: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: bb.text,
    borderRadius: 10,
    backgroundColor: bb.background,
  },
  filters: {
    flexDirection: 'row',
    gap: 6,
  },
  filter: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: bb.background,
  },
  filterSelected: {
    backgroundColor: bb.accent,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: bb.muted,
  },
  filterTextSelected: {
    color: bb.onAccent,
  },
  count: {
    fontSize: 12,
    color: bb.muted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 15,
    textAlign: 'center',
    color: bb.danger,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: bb.accent,
  },
  retryText: {
    fontWeight: '700',
    color: bb.onAccent,
  },
  listContent: {
    padding: 6,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: bb.muted,
  },
  card: {
    flex: 1,
    margin: 6,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: bb.surface,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: bb.imagePlaceholder,
  },
  deceased: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: bb.deceasedBackground,
  },
  deceasedText: {
    fontSize: 11,
    fontWeight: '700',
    color: bb.deceasedText,
  },
  cardBody: {
    padding: 10,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: bb.text,
  },
  nickname: {
    fontSize: 12,
    fontStyle: 'italic',
    color: bb.accent,
  },
  portrayed: {
    fontSize: 12,
    color: bb.muted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  episodes: {
    fontSize: 11,
    color: bb.muted,
  },
}));
