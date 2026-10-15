import type { Translation } from '../../types';
import type en from '../en/errors';

/** Spanish texts: errors. Same keys as ../en/errors.ts. */
const errors: Translation<typeof en> = {
  title: 'Algo salió mal',
  reported: 'Se reportó a Sentry y a Firebase Crashlytics.',
  sentryEvent: 'Evento de Sentry: {{id}}',
  tryAgain: 'Intentar de nuevo',
};

export default errors;
