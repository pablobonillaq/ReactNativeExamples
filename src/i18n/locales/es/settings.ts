import type { Translation } from '../../types';
import type en from '../en/settings';

/** Spanish texts: settings. Same keys as ../en/settings.ts. */
const settings: Translation<typeof en> = {
  title: 'Ajustes',
  subtitle: 'Ejemplos de React Native',
  language: {
    title: 'Idioma',
    description: 'Se guarda en este dispositivo (AsyncStorage).',
    en: 'English',
    es: 'Español',
  },
  theme: {
    title: 'Tema',
    description: 'Sistema sigue el modo claro / oscuro del dispositivo.',
    system: 'Sistema',
    systemCurrent: 'Sistema (ahora {{scheme}})',
    light: 'Claro',
    dark: 'Oscuro',
  },
  schemes: {
    light: 'claro',
    dark: 'oscuro',
  },
  footer:
    'Desliza desde el borde izquierdo en el inicio, o toca ☰, para abrir este menú.',
  goHome: 'Todos los ejemplos',
};

export default settings;
