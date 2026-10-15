import type { Translation } from '../../types';
import type en from '../en/deepLink';

/** Spanish texts: deepLink. Same keys as ../en/deepLink.ts. */
const deepLink: Translation<typeof en> = {
  title: 'Deep linking',
  description:
    'Este botón abre una URL en lugar de navegar. Android / iOS la regresan a esta app, React Navigation la convierte en una pantalla con params, y el formulario enfoca y resalta el campo Comentarios.',
  urlLabel: 'URL',
  button: 'Deja un comentario',
  openError: {
    title: 'No se pudo abrir el enlace',
    message:
      'Vuelve a compilar la app para que se registre el esquema rnexamples://.',
  },
  outside: {
    title: 'Pruébalo desde fuera de la app',
    description:
      'El mismo enlace funciona cuando la app está cerrada o en segundo plano.',
    android: 'Android (emulador o dispositivo)',
    ios: 'Simulador de iOS',
  },
};

export default deepLink;
