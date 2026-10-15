import { HttpError } from '../../observability/http';
import { createLogger } from '../../observability/logger';

const log = createLogger('PokeApi');

export type Pokemon = {
  id: number;
  name: string;
  imageUrl: string;
};

type PokemonListResponse = {
  count: number;
  next: string | null;
  results: { name: string; url: string }[];
};

export type PokemonPage = {
  pokemon: Pokemon[];
  total: number;
};

const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const ARTWORK_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// The list endpoint only returns name + url, e.g. ".../pokemon/25/".
// The id is taken from the url so we don't need one request per Pokémon.
function idFromUrl(url: string) {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
}

export async function fetchPokemonPage(
  offset: number,
  limit: number,
): Promise<PokemonPage> {
  const requestUrl = `${API_URL}?limit=${limit}&offset=${offset}`;
  const done = log.time('GET /pokemon', { offset, limit });
  const response = await fetch(requestUrl);
  done({ status: response.status });
  if (!response.ok) {
    throw new HttpError(response.status, requestUrl);
  }
  const json: PokemonListResponse = await response.json();

  return {
    total: json.count,
    pokemon: json.results.map(({ name, url }) => {
      const id = idFromUrl(url);
      return { id, name, imageUrl: `${ARTWORK_URL}/${id}.png` };
    }),
  };
}
