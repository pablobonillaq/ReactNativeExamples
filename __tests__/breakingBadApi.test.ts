import {
  hasValue,
  isDeathOf,
  type Death,
} from '../src/screens/breakingBad/breakingBadApi';

function death(name: string, character?: Death['character']): Death {
  return {
    id: 1,
    death: name,
    cause: '',
    responsible: '',
    last_words: '',
    season: '1',
    number_of_deaths: 1,
    character,
  };
}

test('isDeathOf uses the linked character id when present', () => {
  const hank = { id: 5, name: 'Hank Schrader' };
  expect(isDeathOf(death('Henry "Hank" Schrader', hank), hank)).toBe(true);
  expect(isDeathOf(death('Hank Schrader', { id: 9, name: 'x' }), hank)).toBe(
    false,
  );
});

test('isDeathOf ignores quoted nicknames when there is no link', () => {
  const walt = { id: 1, name: 'Walter White' };
  expect(isDeathOf(death('Walter "Walt" White', null), walt)).toBe(true);
  expect(isDeathOf(death('Walter White Jr.', null), walt)).toBe(false);
});

test('hasValue treats "Unknown" as missing', () => {
  expect(hasValue('Unknown')).toBe(false);
  expect(hasValue('unknown')).toBe(false);
  expect(hasValue('')).toBe(false);
  expect(hasValue('Heisenberg')).toBe(true);
});
