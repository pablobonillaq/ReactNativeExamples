/** English texts: breakingBad. Keys are used with useTranslation('breakingBad'). */
const breakingBad = {
  retry: 'Retry',
  deceased: '☠ Deceased',
  errors: {
    timeout: 'The request timed out',
    server: 'Server error ({{status}})',
    network: 'Network error: check your connection',
    unknown: 'Unknown error',
  },
  list: {
    searchPlaceholder: 'Search by name, actor or nickname',
    filterAll: 'All',
    count: '{{visible}} of {{total}} characters',
    empty: 'No characters match “{{search}}”',
    episodes: '{{episodes}} ep.',
  },
  detail: {
    alive: '● Alive / unknown',
    sections: {
      profile: 'Profile',
      occupation: 'Occupation',
      appearances: 'Appearances',
      death: 'Death',
      quotes_one: 'Quotes ({{count}})',
      quotes_other: 'Quotes ({{count}})',
      deathsInvolving_one: 'Deaths caused or involved in ({{count}})',
      deathsInvolving_other: 'Deaths caused or involved in ({{count}})',
    },
    profile: {
      portrayedBy: 'Portrayed by',
      birthday: 'Birthday',
      unknown: 'Unknown',
      episodes: 'Episodes',
      deathCount: 'Deaths caused / involved',
    },
    seasonChip: 'S{{season}}',
    death: {
      responsible: 'Responsible: {{name}}',
      lastWords: 'Last words: {{words}}',
      season: 'Season {{season}}',
    },
  },
};

export default breakingBad;
