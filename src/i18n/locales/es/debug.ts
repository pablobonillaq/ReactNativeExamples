import type { Translation } from '../../types';
import type en from '../en/debug';

/** Spanish texts: debug. Same keys as ../en/debug.ts. */
const debug: Translation<typeof en> = {
  actions: {
    logs: {
      label: 'Escribir un log de cada nivel',
      hint: 'debug/info/warn → consola, visor, breadcrumbs, Sentry Logs',
    },
    handledError: {
      label: 'Capturar un error manejado',
      hint: 'log.error → issue en Sentry + non-fatal en Crashlytics, con los logs recientes',
    },
    message: {
      label: 'Capturar un mensaje',
      hint: 'Sentry.captureMessage: un issue sin excepción',
    },
    unhandledError: {
      label: 'Lanzar un error de JS no manejado',
      hint: 'Pantalla roja en dev; Sentry y Crashlytics lo atrapan globalmente',
    },
    unhandledRejection: {
      label: 'Rechazo de promise no manejado',
      hint: 'Una promise rechazada que nadie atrapa',
    },
    renderCrash: {
      label: 'Fallar al renderizar',
      hint: 'react-native-error-boundary muestra un fallback; se manda a ambos',
    },
    trace: {
      label: 'Ejecutar una operación con trace',
      hint: 'Sentry.startSpan → Explore → Traces (con 2 spans hijos)',
    },
    user: {
      label: 'Poner un usuario de prueba',
      hint: 'Sentry.setUser: cada evento siguiente muestra este id de usuario',
    },
    analytics: {
      label: 'Firebase: mandar un evento de Analytics',
      hint: 'logEvent → Firebase → Analytics → DebugView (ver docs)',
    },
    crashlytics: {
      label: 'Firebase: crash de prueba de Crashlytics',
      hint: 'Crash nativo; Crashlytics lo manda en el siguiente arranque',
    },
    nativeCrash: {
      label: 'Crash nativo',
      hint: 'Sentry.nativeCrash; el reporte se manda en el siguiente arranque',
    },
  },
  toast: {
    sent: 'Enviado a Sentry: {{what}}',
    sentryOff: '{{what}} (Sentry apagado)',
    eventId: 'Id del evento: {{id}}',
    what: {
      logs: 'Logs',
      handledError: 'Error manejado',
      message: 'Mensaje',
      trace: 'Trace',
      user: 'Usuario',
    },
    analyticsSent: 'Evento enviado a Firebase Analytics',
    firebaseUnavailable: 'Firebase no disponible (vuelve a compilar la app)',
    eventName: 'Nombre: {{name}}',
  },
  crashAlert: {
    title: '¿Forzar un crash de la app?',
    crashlytics:
      'La app se va a cerrar. Ábrela otra vez para que Crashlytics pueda mandar el reporte.',
    sentry:
      'La app se va a cerrar. Ábrela otra vez para que Sentry pueda mandar el reporte.',
    cancel: 'Cancelar',
    crash: 'Forzar crash',
  },
  status: {
    sentryEnabled: 'Sentry: ✅ activado',
    sentryDisabled: 'Sentry: ⛔ desactivado',
    environment: 'Entorno: {{env}}',
    noDsn:
      'Pega tu DSN en src/observability/sentryConfig.ts. Mientras tanto los logs solo van a Metro y a esta pantalla.',
    firebaseAvailable: 'Firebase: ✅ disponible',
    firebaseUnavailable: 'Firebase: ⛔ no disponible',
    firebaseInfo:
      'Crashlytics recibe los logs info+ y los errores; Analytics recibe pantallas y eventos.',
    firebaseSetup:
      'Necesita android/app/google-services.json y volver a compilar lo nativo.',
  },
  tryIt: 'Pruébalo',
  logsTitle: 'Logs ({{total}}, más recientes primero)',
  clear: 'Borrar',
  filterAll: 'todos',
  empty: 'Todavía no hay logs.',
  sentryEvent: 'Evento de Sentry: {{id}}',
};

export default debug;
