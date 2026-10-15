import axios from 'axios';
import i18n from '../../i18n';
import { instrumentAxios } from '../../observability/http';

/**
 * The original API (https://www.breakingbadapi.com/api/, documented at
 * badapi-one.vercel.app) no longer exists: its domain doesn't resolve.
 * This is a community-hosted clone with the same endpoints and extra fields.
 */
export const BREAKING_BAD_API_URL = 'https://ixd-breaking-bad.vercel.app/api';

/** Shared axios instance: base URL and timeout apply to every request. */
export const breakingBadApi = axios.create({
  baseURL: BREAKING_BAD_API_URL,
  timeout: 15000,
});

// Logs method, URL, status and duration of every request.
instrumentAxios(breakingBadApi, 'BreakingBadApi');

export type Series = 'Breaking Bad' | 'Better Call Saul';

export type Character = {
  id: number;
  name: string;
  full_name: string;
  nickname: string;
  portrayed: string;
  img: string;
  birth_date: string;
  occupation: string[];
  episodes_count: string;
  /** Main series of the character. */
  category: Series;
  /** Seasons of the main series the character appears in (e.g. "5a"). */
  appearances: string[];
  better_call_saul_appearance: string[];
};

export type Quote = {
  id: number;
  quote: string;
  author: string;
  series: Series;
};

export type Death = {
  id: number;
  /** Name of who died. */
  death: string;
  cause: string;
  responsible: string;
  last_words: string;
  season: string;
  number_of_deaths: number;
  /** Linked character, when the API could match it (not always). */
  character?: { id: number; name: string } | null;
};

/** 'Walter "Walt" White' -> 'walter white' */
function normalizeName(name: string) {
  return name
    .replace(/["“”][^"“”]*["“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Whether a death is the given character's own death. Names in /deaths
 * don't always match character names ('Henry "Hank" Schrader' vs
 * 'Hank Schrader'), so the linked character id is used when present and
 * the name without quoted nicknames otherwise.
 */
export function isDeathOf(
  death: Death,
  character: { id: number; name: string },
) {
  if (death.character?.id) {
    return death.character.id === character.id;
  }
  return normalizeName(death.death) === normalizeName(character.name);
}

/** GET /characters, optionally filtered with ?category=... */
export async function getCharacters(category?: Series, signal?: AbortSignal) {
  const { data } = await breakingBadApi.get<Character[]>('/characters', {
    params: category ? { category } : undefined,
    signal,
  });
  return data;
}

/** GET /characters/:id (the API returns an array with one item). */
export async function getCharacter(id: number, signal?: AbortSignal) {
  const { data } = await breakingBadApi.get<Character[]>(`/characters/${id}`, {
    signal,
  });
  if (!data[0]) {
    throw new Error(`Character ${id} not found`);
  }
  return data[0];
}

/** GET /quote?author=... */
export async function getQuotesByAuthor(author: string, signal?: AbortSignal) {
  const { data } = await breakingBadApi.get<Quote[] | ''>('/quote', {
    params: { author },
    signal,
  });
  // The API answers with an empty body when the author has no quotes.
  return Array.isArray(data) ? data : [];
}

/** GET /death-count?name=... : how many deaths the character caused. */
export async function getDeathCount(name: string, signal?: AbortSignal) {
  const { data } = await breakingBadApi.get<{ deathCount: number }[]>(
    '/death-count',
    { params: { name }, signal },
  );
  return data[0]?.deathCount ?? 0;
}

/** GET /death?name=... : deaths the character caused or was involved in. */
export async function getDeathsInvolving(name: string, signal?: AbortSignal) {
  const { data } = await breakingBadApi.get<Death[] | ''>('/death', {
    params: { name },
    signal,
  });
  return Array.isArray(data) ? data : [];
}

let allDeathsRequest: Promise<Death[]> | null = null;

/**
 * GET /deaths, requested once and shared: it's used to know who died
 * (the `status` field of the API is always "Unknown").
 */
export function getAllDeaths() {
  if (!allDeathsRequest) {
    allDeathsRequest = breakingBadApi
      .get<Death[]>('/deaths')
      .then(response => response.data)
      .catch(error => {
        allDeathsRequest = null; // allow retrying later
        throw error;
      });
  }
  return allDeathsRequest;
}

/**
 * Readable message for axios errors (timeouts, HTTP status, no network),
 * in the current language. Called when the error is shown.
 */
export function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return i18n.t('breakingBad:errors.timeout');
    }
    if (error.response) {
      return i18n.t('breakingBad:errors.server', {
        status: error.response.status,
      });
    }
    return i18n.t('breakingBad:errors.network');
  }
  return error instanceof Error
    ? error.message
    : i18n.t('breakingBad:errors.unknown');
}

/** The API uses "Unknown" / "unknown" for missing values. */
export function hasValue(value: string | undefined): value is string {
  return !!value && value.trim().toLowerCase() !== 'unknown';
}
