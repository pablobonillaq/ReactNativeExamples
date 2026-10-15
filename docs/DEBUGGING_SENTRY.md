# Debugging con Sentry y logs

Esta guía explica qué se instaló, cómo activarlo y cómo usarlo para encontrar errores en la app.

## 1. Activarlo (una sola vez)

1. **Instala el SDK** (agrega la dependencia y actualiza `package-lock.json`):

   ```sh
   npm install @sentry/react-native
   ```

   No uses `npx @sentry/wizard`: la configuración ya está hecha a mano y el wizard la duplicaría.

2. **Crea el proyecto en Sentry**: en [sentry.io](https://sentry.io), crea un proyecto de tipo _React Native_ y copia el **DSN** (Settings → Projects → tu proyecto → Client Keys).

3. **Pega el DSN** en `src/observability/sentryConfig.ts`:

   ```ts
   export const SENTRY_DSN: string =
     'https://xxxx@o0000.ingest.us.sentry.io/0000';
   ```

4. **Recompila la app nativa** (el SDK incluye código nativo para los crashes):

   ```sh
   npm run android
   ```

   En iOS: `cd ios && bundle exec pod install && cd ..` y luego `npm run ios`.

5. Comprueba que todo sigue en verde:

   ```sh
   npx tsc --noEmit
   npm test
   npm run lint
   ```

Mientras el DSN esté vacío, la app funciona igual: los logs solo salen en la consola de Metro y en el visor de logs de la app.

## 2. Qué se agregó

| Archivo                                     | Para qué sirve                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/observability/sentry.ts`               | `Sentry.init`: errores, crashes nativos, logs, trazas de navegación y filtros de privacidad. Se importa primero en `index.js`. |
| `src/observability/sentryConfig.ts`         | DSN y opciones (enviar en desarrollo, modo debug del SDK, porcentaje de trazas).                                               |
| `src/observability/logger.ts`               | Logger de la app: `createLogger('Pantalla')` con `debug/info/warn/error/time`.                                                 |
| `src/observability/http.ts`                 | Logs de cada petición axios (método, URL, status, duración) y `logRequestError`, que elige el nivel correcto según el error.   |
| `src/observability/ErrorFallback.tsx`       | Pantalla de "Something went wrong" cuando un componente falla al renderizar.                                                   |
| `src/screens/debug/SentryDebugScreen.tsx`   | Pantalla **Debugging (Sentry + logs)**: botones para provocar errores y visor de logs.                                         |
| `App.tsx`                                   | `Sentry.wrap`, `Sentry.ErrorBoundary`, integración con React Navigation, log de cada cambio de pantalla y de deep links.       |
| `src/store/index.ts`                        | `Sentry.createReduxEnhancer()`: cada acción de Redux queda como breadcrumb y el estado se adjunta a los errores.               |
| `metro.config.js`                           | `withSentryConfig`: agrega un Debug ID a cada bundle para ligarlo con su source map.                                           |
| `jest.setup.js`, `__tests__/logger.test.ts` | Mock de Sentry para Jest y pruebas del logger.                                                                                 |

### Logs agregados en la app

- **Navegación**: cada pantalla visitada (con sus params) y cada deep link recibido.
- **APIs** (Breaking Bad con axios, PokeAPI con fetch): petición, status y duración; errores con el nivel correcto.
- **Todos**: acciones de Context, Zustand y MobX; Redux vía el enhancer de Sentry; AsyncStorage (carga/guardado) y SQLite (cada sentencia como _span_ con su duración).
- **Galería de fotos**: permisos, fotos agregadas/eliminadas, fotos que ya no existen en disco, errores de cámara.
- **Share & copy**: cada acción, la descarga de la imagen y sus errores.
- **Vault**: configuración, bloqueo/desbloqueo, PIN incorrecto e intentos, biometría. **Nunca** se registra el PIN, las contraseñas ni el contenido de las entradas.
- **Formularios**: envío y campos con error (solo nombres de campos, no los valores).
- **Buses**: inicio y fin de la simulación.
- **App**: arranque, si Sentry está activo y cambios foreground/background.

## 3. Cómo usar el logger en código nuevo

```ts
import { createLogger } from '../../observability/logger';
import { logRequestError } from '../../observability/http';

const log = createLogger('MiPantalla');

log.debug('Detalle útil solo al desarrollar', { id });
log.info('Algo importante pasó', { count: items.length });
log.warn('Falló pero es esperado (offline, cancelado)', { url }, error);
log.error('Falló algo que hay que arreglar', error, { id }); // crea un issue en Sentry

const done = log.time('Cargar datos');
await cargar();
done({ rows: 20 }); // => "Cargar datos" { rows: 20, durationMs: 312 }

try {
  await api.get('/algo');
} catch (e) {
  logRequestError(log, 'No se pudo cargar algo', e); // cancelado → debug, sin red → warn, resto → error
}
```

¿Qué nivel usar?

| Nivel   | Consola (dev) | Visor en app | Breadcrumb | Sentry Logs | Issue en Sentry |
| ------- | ------------- | ------------ | ---------- | ----------- | --------------- |
| `debug` | ✅            | ✅           | ✅         | —           | —               |
| `info`  | ✅            | ✅           | ✅         | ✅          | —               |
| `warn`  | ✅            | ✅           | ✅         | ✅          | —               |
| `error` | ✅            | ✅           | ✅         | ✅          | ✅              |

Las claves que parecen secretas (`pin`, `password`, `token`, `hash`, `salt`, `auth`…) se reemplazan por `[redacted]` automáticamente, pero lo correcto es no pasarlas nunca.

## 4. Flujo para debuggear un error

1. **Reproduce o espera el error.** Sentry captura solo: errores no manejados, promesas rechazadas sin `catch`, errores de render (muestra `ErrorFallback`) y crashes nativos (se envían al volver a abrir la app). Los `log.error` también crean un issue.
2. **Abre el issue** en sentry.io → **Issues**. Si tienes el _event id_ (aparece en el toast, en `ErrorFallback` y en el visor de logs), búscalo con `id:<event id>`.
3. **Lee el stack trace.** En desarrollo, el SDK lo simboliza con Metro, así que verás las líneas de tu código TypeScript. En builds release necesitas subir source maps (sección 6).
4. **Revisa los breadcrumbs**: la línea de tiempo de lo que pasó antes del error. Ahí verás las pantallas visitadas, los toques (`Sentry.wrap`), las peticiones HTTP, las acciones de Redux y todos los logs `[Scope] mensaje` con sus datos.
5. **Revisa los tags y el contexto**: `screen` (pantalla actual), `scope` (módulo que llamó a `log.error`), `environment`, dispositivo, versión de Android/iOS y, en errores de Redux, el estado del store.
6. **Busca en Logs** (sentry.io → Explore → **Logs**) para ver todo lo que pasó en una sesión aunque no hubiera error; filtra por `scope:Vault`, por nivel o por texto.
7. **Rendimiento** (Explore → **Traces**): cada navegación es una traza con el tiempo hasta que se muestra la pantalla, las peticiones HTTP hechas durante ella y las sentencias SQLite.

## 5. Probarlo con la pantalla de debug

Abre la app → **Debugging (Sentry + logs)** (último elemento del menú).

| Botón                       | Qué ver en Sentry                                                           |
| --------------------------- | --------------------------------------------------------------------------- |
| Write one log of each level | Explore → Logs (`info`/`warn`) y breadcrumbs del siguiente error.           |
| Capture a handled error     | Issues → `SyntaxError` con el contexto `log` y breadcrumbs.                 |
| Capture a message           | Issues → mensaje sin excepción.                                             |
| Throw an unhandled JS error | Issues → `Unhandled JS error test` (en dev verás también la pantalla roja). |
| Unhandled promise rejection | Issues → `Unhandled promise rejection test`.                                |
| Crash while rendering       | La app muestra `ErrorFallback` con el event id; "Try again" la recupera.    |
| Run a traced operation      | Explore → Traces → `Debug screen: fake checkout` con 2 spans.               |
| Set a test user             | Los siguientes eventos muestran `user.id = demo-user-42`.                   |
| Native crash                | La app se cierra; ábrela de nuevo y aparece el crash nativo en Issues.      |

Debajo de los botones está el **visor de logs**: las últimas 300 líneas del logger, filtrables por nivel. Sirve incluso sin DSN y en un dispositivo sin Metro conectado.

## 6. Ajustes útiles

- **Ver qué hace el SDK** (si un evento no llega): `SENTRY_SDK_DEBUG = true` en `sentryConfig.ts` y mira la consola de Metro.
- **No enviar nada mientras desarrollas**: `SENTRY_ENABLED_IN_DEV = false`.
- **Menos trazas en producción**: ajusta `TRACES_SAMPLE_RATE`.
- **Source maps para builds release (Android)**: para ver tu código en lugar del bundle minificado, agrega al inicio de `android/app/build.gradle`, debajo de los `apply plugin`:

  ```groovy
  apply from: new File(["node", "--print", "require.resolve('@sentry/react-native/package.json')"].execute().text.trim(), "../sentry.gradle")
  ```

  Crea `android/sentry.properties` con `defaults.org=<org>` y `defaults.project=<proyecto>`, y define la variable de entorno `SENTRY_AUTH_TOKEN` (no guardes el token en git). Desde ese momento, cada build release sube sus source maps.

- **Capturas de pantalla / Session Replay**: están desactivadas a propósito porque el vault muestra contraseñas en pantalla. Si las activas, enmascara esa pantalla.
