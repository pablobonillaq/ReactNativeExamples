import type { Translation } from '../../types';
import type en from '../en/breakingBad';

/** Spanish texts: breakingBad. Same keys as ../en/breakingBad.ts. */
const breakingBad: Translation<typeof en> = {
  retry: 'Reintentar',
  deceased: '☠ Fallecido',
  errors: {
    timeout: 'La solicitud tardó demasiado',
    server: 'Error del servidor ({{status}})',
    network: 'Error de red: revisa tu conexión',
    unknown: 'Error desconocido',
  },
  list: {
    searchPlaceholder: 'Busca por nombre, actor o apodo',
    filterAll: 'Todos',
    count: '{{visible}} de {{total}} personajes',
    empty: 'Ningún personaje coincide con “{{search}}”',
    episodes: '{{episodes}} ep.',
  },
  detail: {
    alive: '● Vivo / desconocido',
    sections: {
      profile: 'Perfil',
      occupation: 'Ocupación',
      appearances: 'Apariciones',
      death: 'Muerte',
      quotes_one: 'Frase ({{count}})',
      quotes_other: 'Frases ({{count}})',
      deathsInvolving_one: 'Muerte causada o en la que participó ({{count}})',
      deathsInvolving_other:
        'Muertes causadas o en las que participó ({{count}})',
    },
    profile: {
      portrayedBy: 'Interpretado por',
      birthday: 'Cumpleaños',
      unknown: 'Desconocido',
      episodes: 'Episodios',
      deathCount: 'Muertes causadas / en las que participó',
    },
    seasonChip: 'T{{season}}',
    death: {
      responsible: 'Responsable: {{name}}',
      lastWords: 'Últimas palabras: {{words}}',
      season: 'Temporada {{season}}',
    },
  },
};

export default breakingBad;
