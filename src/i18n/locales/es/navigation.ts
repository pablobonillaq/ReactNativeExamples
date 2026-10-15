import type { Translation } from '../../types';
import type en from '../en/navigation';

/** Spanish texts: navigation. Same keys as ../en/navigation.ts. */
const navigation: Translation<typeof en> = {
  screens: {
    Home: 'Ejemplos de React Native',
    Lists: 'Listas: rendimiento',
    Pokemon: 'Pokémon',
    PokemonInfinite: 'Pokémon: scroll infinito',
    PersonForm: 'Formulario de persona',
    PersonFormRHF: 'Formulario de persona (RHF)',
    DeepLinkDemo: 'Deep linking',
    BreakingBad: 'Breaking Bad',
    Todo: 'Lista de tareas (Context API)',
    TodoRedux: 'Lista de tareas (Redux Toolkit)',
    TodoZustand: 'Lista de tareas (Zustand)',
    TodoMobx: 'Lista de tareas (MobX)',
    TodoStorage: 'Lista de tareas (AsyncStorage)',
    TodoSqlite: 'Lista de tareas (SQLite)',
    TodoNative: 'Lista de tareas (módulo nativo)',
    PhotoGallery: 'Galería de fotos',
    Accessibility: 'Accesibilidad',
    Vault: 'Bóveda de contraseñas',
    BusesMap: 'Camiones en vivo',
    Share: 'Compartir y copiar',
    AnimatedApi: 'Animated API',
    Reanimated: 'Reanimated',
    Flipper: 'Flipper → DevTools',
    Hermes: 'Motor Hermes',
    Rerenders: 'Evitar re-renders',
    Bridging: 'Bridging (JS ⇄ nativo)',
    SentryDebug: 'Depuración (Sentry + Firebase)',
  },
  menu: {
    Lists: {
      title: 'Listas',
      description: 'ScrollView vs FlatList vs FlashList con miles de elementos',
    },
    Pokemon: {
      title: 'Pokémon (API + jalar para actualizar)',
      description:
        'FlashList con datos de PokeAPI; jala hacia abajo para cargar 20 más',
    },
    PokemonInfinite: {
      title: 'Pokémon (API + scroll infinito)',
      description: 'FlashList con datos de PokeAPI; baja para cargar 25 más',
    },
    PersonForm: {
      title: 'Formulario (Formik + validación)',
      description:
        'KeyboardAvoidingView, validación con Formik + Yup y un toast',
    },
    PersonFormRHF: {
      title: 'Formulario (React Hook Form + validación)',
      description: 'El mismo formulario con React Hook Form + resolver de Yup',
    },
    NavigationDemo: {
      title: 'Navegación (drawer, tabs, stack)',
      description: 'Cada navegador abre la misma pantalla con parámetros',
    },
    DeepLinkDemo: {
      title: 'Deep linking',
      description: 'Una URL abre el formulario y resalta el campo Comentarios',
    },
    BreakingBad: {
      title: 'Breaking Bad (axios)',
      description: 'Personajes, frases y muertes de una API REST con axios',
    },
    Todo: {
      title: 'Lista de tareas (Context API)',
      description: 'Estado compartido a 5 niveles sin prop drilling',
    },
    TodoRedux: {
      title: 'Lista de tareas (Redux Toolkit)',
      description: 'La misma lista con un store de Redux, slice y selectores',
    },
    TodoZustand: {
      title: 'Lista de tareas (Zustand)',
      description: 'La misma lista con un store de Zustand, sin Provider',
    },
    TodoMobx: {
      title: 'Lista de tareas (MobX)',
      description: 'La misma lista con un store observable de MobX',
    },
    TodoStorage: {
      title: 'Lista de tareas (AsyncStorage)',
      description:
        'El localStorage de RN: las tareas sobreviven al cerrar la app',
    },
    TodoSqlite: {
      title: 'Lista de tareas (SQLite)',
      description:
        'Tareas guardadas como filas de una tabla SQLite con op-sqlite',
    },
    TodoNative: {
      title: 'Lista de tareas (Turbo Native Module)',
      description: 'Kotlin / Objective-C++ guardan y buscan las tareas',
    },
    PhotoGallery: {
      title: 'Galería de fotos (cámara + galería)',
      description:
        'Selector estilo Telegram con cámara en vivo; se guarda en el dispositivo',
    },
    Accessibility: {
      title: 'Accesibilidad (VoiceOver / TalkBack)',
      description:
        'Etiquetas, pistas y roles que leen los lectores de pantalla',
    },
    Vault: {
      title: 'Bóveda de contraseñas (almacenamiento seguro)',
      description: 'PIN o biometría, bloqueo, Keychain / Keystore',
    },
    BusesMap: {
      title: 'Mapa de camiones en vivo (Calzada Independencia)',
      description:
        '10 camiones simulados que se actualizan cada 3 s en un mapa MapLibre',
    },
    Share: {
      title: 'Compartir y copiar (texto e imagen)',
      description:
        'Hoja para compartir del sistema y portapapeles para texto e imágenes',
    },
    AnimatedApi: {
      title: 'Animaciones (Animated API)',
      description: 'timing, spring, decay, Easing, interpolate, gestos…',
    },
    Reanimated: {
      title: 'Animaciones (Reanimated)',
      description: 'Shared values, gestos, layout animations, sensores…',
    },
    Flipper: {
      title: 'Flipper → React Native DevTools',
      description: 'Qué era Flipper y cómo depurar sin él hoy',
    },
    Hermes: {
      title: 'Motor Hermes',
      description: 'Bytecode, memoria y GC, event loop, Intl y benchmarks',
    },
    Rerenders: {
      title: 'Evitar re-renders',
      description: 'React.memo, useCallback, useMemo y useRef lado a lado',
    },
    Bridging: {
      title: 'Bridging (JS ⇄ nativo)',
      description:
        'Síncrono, asíncrono, callbacks, eventos y tipos con Kotlin / Obj-C',
    },
    SentryDebug: {
      title: 'Depuración (Sentry + Firebase)',
      description: 'Errores, crashes, trazas y logs en Sentry y Crashlytics',
    },
  },
};

export default navigation;
