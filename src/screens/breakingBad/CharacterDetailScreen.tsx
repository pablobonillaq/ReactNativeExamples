import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
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
import type { RootStackScreenProps } from '../../navigation/types';
import {
  errorMessage,
  getAllDeaths,
  getCharacter,
  getDeathCount,
  getDeathsInvolving,
  getQuotesByAuthor,
  hasValue,
  isDeathOf,
  type Character,
  type Death,
  type Quote,
} from './breakingBadApi';
import { makeBreakingBadStyles, SeriesBadge, useBreakingBadColors } from './ui';
import { logRequestError } from '../../observability/http';
import { createLogger } from '../../observability/logger';

type Details = {
  character: Character;
  /** null when that request failed: the section is hidden. */
  quotes: Quote[] | null;
  deathCount: number | null;
  deathsInvolving: Death[] | null;
  ownDeath: Death | null;
};

const log = createLogger('BreakingBadCharacter');

function valueOrNull<T>(result: PromiseSettledResult<T>) {
  return result.status === 'fulfilled' ? result.value : null;
}

export function CharacterDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'BreakingBadCharacter'>) {
  const { id, name } = route.params;
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const bb = useBreakingBadColors();
  const { t } = useTranslation('breakingBad');
  const [details, setDetails] = useState<Details | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // The header follows the Breaking Bad palette of the current theme.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: bb.surface },
      headerTintColor: bb.text,
    });
  }, [navigation, bb]);

  // Five requests in parallel. Only the character itself is required:
  // Promise.allSettled lets the other sections fail without breaking the
  // screen.
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setError(null);
    Promise.allSettled([
      getCharacter(id, signal),
      getQuotesByAuthor(name, signal),
      getDeathCount(name, signal),
      getDeathsInvolving(name, signal),
      getAllDeaths(),
    ]).then(([character, quotes, deathCount, involving, allDeaths]) => {
      if (signal.aborted) {
        return;
      }
      if (character.status === 'rejected') {
        logRequestError(log, 'Could not load character', character.reason, {
          id,
        });
        setError(errorMessage(character.reason));
        return;
      }
      // Optional sections: a failure only hides that section.
      const optional = { quotes, deathCount, involving, allDeaths };
      Object.entries(optional).forEach(([section, result]) => {
        if (result.status === 'rejected') {
          logRequestError(log, `Section "${section}" failed`, result.reason, {
            id,
          });
        }
      });
      log.info('Character loaded', { id, name });
      const deaths = valueOrNull(allDeaths);
      setDetails({
        character: character.value,
        quotes: valueOrNull(quotes),
        deathCount: valueOrNull(deathCount),
        // /death?name= also returns the character's own death; that one is
        // shown in its own section.
        deathsInvolving:
          valueOrNull(involving)?.filter(d => !isDeathOf(d, { id, name })) ??
          null,
        ownDeath: deaths?.find(d => isDeathOf(d, { id, name })) ?? null,
      });
    });
    return () => controller.abort();
  }, [id, name, reloadKey]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => setReloadKey(k => k + 1)}
        >
          <Text style={styles.retryText}>{t('retry')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={bb.accent} />
      </View>
    );
  }

  const { character, quotes, deathCount, deathsInvolving, ownDeath } = details;
  const otherSeriesSeasons =
    character.category === 'Better Call Saul'
      ? []
      : character.better_call_saul_appearance;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <Image source={{ uri: character.img }} style={styles.hero} />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <SeriesBadge series={character.category} />
          <Text style={[styles.status, ownDeath && styles.statusDead]}>
            {ownDeath ? t('deceased') : t('detail.alive')}
          </Text>
        </View>
        <Text style={styles.name}>{character.name}</Text>
        {hasValue(character.full_name) &&
        character.full_name !== character.name ? (
          <Text style={styles.fullName}>{character.full_name}</Text>
        ) : null}
        {hasValue(character.nickname) ? (
          <Text style={styles.nickname}>“{character.nickname}”</Text>
        ) : null}

        <Section title={t('detail.sections.profile')}>
          <InfoRow
            label={t('detail.profile.portrayedBy')}
            value={character.portrayed}
          />
          <InfoRow
            label={t('detail.profile.birthday')}
            value={
              hasValue(character.birth_date)
                ? character.birth_date
                : t('detail.profile.unknown')
            }
          />
          <InfoRow
            label={t('detail.profile.episodes')}
            value={character.episodes_count}
          />
          {deathCount !== null ? (
            <InfoRow
              label={t('detail.profile.deathCount')}
              value={String(deathCount)}
            />
          ) : null}
        </Section>

        {character.occupation.length > 0 ? (
          <Section title={t('detail.sections.occupation')}>
            {character.occupation.map(job => (
              <Text key={job} style={styles.listItem}>
                • {job}
              </Text>
            ))}
          </Section>
        ) : null}

        <Section title={t('detail.sections.appearances')}>
          <Seasons label={character.category} seasons={character.appearances} />
          {otherSeriesSeasons.length > 0 ? (
            <Seasons label="Better Call Saul" seasons={otherSeriesSeasons} />
          ) : null}
        </Section>

        {ownDeath ? (
          <Section title={t('detail.sections.death')}>
            <DeathCard death={ownDeath} showVictim={false} />
          </Section>
        ) : null}

        {quotes && quotes.length > 0 ? (
          <Section
            title={t('detail.sections.quotes', { count: quotes.length })}
          >
            {quotes.map(q => (
              <View key={q.id} style={styles.quote}>
                <Text style={styles.quoteText}>“{q.quote}”</Text>
                <Text style={styles.quoteSeries}>{q.series}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        {deathsInvolving && deathsInvolving.length > 0 ? (
          <Section
            title={t('detail.sections.deathsInvolving', {
              count: deathsInvolving.length,
            })}
          >
            {deathsInvolving.map(d => (
              <DeathCard key={d.id} death={d} showVictim />
            ))}
          </Section>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Seasons({ label, seasons }: { label: string; seasons: string[] }) {
  const styles = useStyles();
  const { t } = useTranslation('breakingBad');
  return (
    <View style={styles.seasons}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.chips}>
        {seasons.length > 0 ? (
          seasons.map(season => (
            <Text key={season} style={styles.chip}>
              {t('detail.seasonChip', { season })}
            </Text>
          ))
        ) : (
          <Text style={styles.infoValue}>—</Text>
        )}
      </View>
    </View>
  );
}

function DeathCard({
  death,
  showVictim,
}: {
  death: Death;
  showVictim: boolean;
}) {
  const styles = useStyles();
  const { t } = useTranslation('breakingBad');
  return (
    <View style={styles.deathCard}>
      {showVictim ? (
        <Text style={styles.deathVictim}>
          {death.death}
          {death.number_of_deaths > 1 ? ` (${death.number_of_deaths})` : ''}
        </Text>
      ) : null}
      <Text style={styles.deathText}>{death.cause}</Text>
      {hasValue(death.responsible) ? (
        <Text style={styles.deathMeta}>
          {t('detail.death.responsible', { name: death.responsible })}
        </Text>
      ) : null}
      {hasValue(death.last_words) ? (
        <Text style={styles.deathMeta}>
          {t('detail.death.lastWords', { words: death.last_words })}
        </Text>
      ) : null}
      <Text style={styles.deathMeta}>
        {t('detail.death.season', { season: death.season })}
      </Text>
    </View>
  );
}

const useStyles = makeBreakingBadStyles(bb => ({
  container: {
    flex: 1,
    backgroundColor: bb.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: bb.background,
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
  hero: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: bb.imagePlaceholder,
  },
  content: {
    padding: 16,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    color: bb.accent,
  },
  statusDead: {
    color: bb.danger,
  },
  name: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
    color: bb.text,
  },
  fullName: {
    fontSize: 15,
    color: bb.muted,
  },
  nickname: {
    fontSize: 15,
    fontStyle: 'italic',
    color: bb.accent,
  },
  section: {
    marginTop: 16,
    padding: 14,
    gap: 8,
    borderRadius: 12,
    backgroundColor: bb.surface,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: bb.accent,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: bb.muted,
  },
  infoValue: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    color: bb.text,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 20,
    color: bb.text,
  },
  seasons: {
    gap: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
    color: bb.text,
    backgroundColor: bb.background,
  },
  quote: {
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: bb.accent,
    gap: 2,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: bb.text,
  },
  quoteSeries: {
    fontSize: 11,
    color: bb.muted,
  },
  deathCard: {
    padding: 10,
    gap: 4,
    borderRadius: 8,
    backgroundColor: bb.background,
  },
  deathVictim: {
    fontSize: 14,
    fontWeight: '700',
    color: bb.danger,
  },
  deathText: {
    fontSize: 13,
    lineHeight: 19,
    color: bb.text,
  },
  deathMeta: {
    fontSize: 12,
    color: bb.muted,
  },
}));
