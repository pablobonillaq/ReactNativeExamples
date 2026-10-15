import type { Translation } from '../../types';
import type en from '../en/pokemon';

/** Spanish texts: pokemon. Same keys as ../en/pokemon.ts. */
const pokemon: Translation<typeof en> = {
  retry: 'Reintentar',
  errors: {
    unknown: 'Error desconocido',
  },
  paged: {
    showing: 'Mostrando #{{from}} – #{{to}}',
    hint: 'Desliza hacia abajo para cargar los siguientes {{size}}',
  },
  infinite: {
    loaded: 'Cargados: {{loaded}}',
    loadedOf: 'Cargados: {{loaded}} de {{total}}',
    hint: 'Haz scroll hacia abajo para cargar {{size}} más automáticamente',
    end: '¡Ya los atrapaste a todos!',
  },
};

export default pokemon;
