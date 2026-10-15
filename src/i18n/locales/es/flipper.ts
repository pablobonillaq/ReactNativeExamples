import type { Translation } from '../../types';
import type en from '../en/flipper';

/** Spanish texts: flipper. Same keys as ../en/flipper.ts. */
const flipper: Translation<typeof en> = {
  ui: {
    replacementFlipper: 'Flipper: {{plugin}}',
  },
  about: {
    section: '¿Qué era Flipper?',
    title: 'Flipper (2018 – 2024 en React Native)',
    description:
      'Una app de escritorio de Meta que se conectaba a la app mediante una librería nativa y ofrecía plugins: logs, red, layout, React DevTools, debugger de Hermes, bases de datos, reportes de crashes…',
    removed:
      'En <b>React Native 0.74</b> Flipper se quitó de los proyectos nuevos y dejó de tener soporte: agregaba dependencias nativas pesadas, hacía más lentos los builds y seguido se rompía al actualizar. Todavía existe como herramienta independiente para apps nativas, pero esta app (React Native 0.87, Nueva Arquitectura) no lo usa.',
    replacement:
      'Su reemplazo es <b>React Native DevTools</b>: un debugger basado en Chrome DevTools que viene incluido en React Native, sin nada que instalar.',
  },
  open: {
    section: 'Abre React Native DevTools',
    subtitle: 'Necesitas un build de debug y Metro corriendo.',
    title: 'Cómo abrirlo',
    steps: {
      run: 'Corre la app en debug (`npm run android`) con Metro corriendo (`npm start`).',
      press:
        'En la terminal de Metro presiona `j`, o abre el Dev Menu (`Ctrl+M` en el emulador, agita un teléfono real) → Open DevTools.',
      tabs: 'Se abre una ventana parecida a Chrome con pestañas: Console, Sources, Network, Performance, Memory, ⚛️ Components y ⚛️ Profiler.',
    },
    note: 'Cada tarjeta de abajo muestra un plugin de Flipper, qué lo reemplaza y un botón para verlo funcionando.',
  },
  try: {
    section: 'Pruébalo',
    subtitle: 'Deja DevTools abierto mientras presionas los botones.',
  },
  migration: {
    section: 'Tabla de migración',
    subtitle: 'Plugin de Flipper → qué usar ahora.',
    rows: {
      logs: {
        plugin: 'Logs',
        now: 'DevTools → Console · terminal de Metro · Logcat de Android Studio',
      },
      network: {
        plugin: 'Network',
        now: 'DevTools → Network (React Native 0.83+)',
      },
      layout: {
        plugin: 'Layout inspector',
        now: 'DevTools → Components · Element Inspector · Layout Inspector de Android Studio',
      },
      reactDevTools: {
        plugin: 'React DevTools',
        now: 'Incluido en React Native DevTools (Components + Profiler)',
      },
      hermesDebugger: {
        plugin: 'Hermes Debugger',
        now: 'DevTools → Sources (breakpoints, paso a paso, watch)',
      },
      performance: {
        plugin: 'Performance / Perf monitor',
        now: 'DevTools → Performance (0.83+) · Dev Menu → Perf Monitor',
      },
      crashReporter: {
        plugin: 'Crash reporter',
        now: 'Sentry (ve la pantalla de Debugging) · Logcat',
      },
      storage: {
        plugin: 'AsyncStorage / Shared Preferences',
        now: 'Visor dentro de la app · console.table · App Inspection',
      },
      databases: {
        plugin: 'Bases de datos (SQLite)',
        now: 'Android Studio → App Inspection → Database Inspector',
      },
      images: {
        plugin: 'Imágenes',
        now: 'DevTools → Network (peticiones de imágenes) · Profiler de Android Studio',
      },
      redux: {
        plugin: 'Plugins de Redux / MobX',
        now: 'Reactotron, o Redux DevTools con un middleware solo para desarrollo',
      },
    },
    note: 'Otras herramientas: Reactotron (logs, estado, red, AsyncStorage) y Radon IDE (debugger dentro de VS Code) cubren parte de lo que hacía Flipper.',
  },
  console: {
    title: 'Logs',
    description:
      'Flipper tenía un plugin Logs con los logs del dispositivo. Hoy los logs de JS van a la pestaña Console de React Native DevTools (y a la terminal de Metro).',
    replacement: {
      flipper: 'plugin Logs',
      today: 'DevTools → Console',
    },
    buttons: {
      object: 'objeto',
      logger: 'logger (Sentry)',
    },
    sent: '{{label}} enviado: mira la pestaña Console',
    note: 'Los logs nativos (Java/Kotlin, crashes) están en Android Studio → Logcat, o con adb logcat.',
  },
  network: {
    title: 'Red',
    description:
      'Cada botón hace una petición real. En el panel Network ves su URL, status, headers, tiempos y el cuerpo de la respuesta.',
    replacement: {
      flipper: 'plugin Network',
      today: 'DevTools → Network (RN 0.83+)',
    },
    results: {
      weighs: '{{status}}, {{name}} pesa {{weight}}',
      created: '{{status}}, id creado {{id}}',
      failed: '(petición fallida en rojo)',
      characters: '{{status}}, {{total}} personajes',
    },
    steps: {
      open: 'Abre DevTools: presiona `j` en la terminal de Metro.',
      tab: 'Ve a la pestaña Network y presiona un botón de arriba.',
      click: 'Haz clic en una petición → Headers, Preview, Response, Timing.',
    },
  },
  components: {
    title: 'Componentes y layout',
    description:
      'Flipper mostraba el árbol de vistas nativas y un plugin de React DevTools. Ahora React DevTools viene integrado en React Native DevTools.',
    replacement: {
      flipper: 'Layout inspector + plugin de React DevTools',
      today: 'DevTools → ⚛️ Components · Dev Menu → Element Inspector',
    },
    inspectMe: 'Inspeccióname',
    countState: 'count (estado): {{value}}',
    steps: {
      search: 'DevTools → ⚛️ Components → busca "InspectMe".',
      select:
        'Selecciónalo: ves sus props (title, color) y su estado (count). Edítalos ahí y la pantalla se actualiza.',
      device:
        'En el dispositivo: Dev Menu (Ctrl+M) → Toggle Element Inspector, luego toca la caja para ver sus estilos y tamaño.',
      native:
        'Árbol de vistas nativas: Android Studio → Tools → Layout Inspector.',
    },
  },
  profiler: {
    title: 'Profiler',
    description:
      'Muestra qué componentes se renderizaron, por qué y cuánto tardó cada uno.',
    replacement: {
      flipper: 'profiler de React DevTools',
      today: 'DevTools → ⚛️ Profiler',
    },
    buttons: {
      render: 'Renderizar 60 filas lentas',
      rerender: 'Re-renderizar todo',
      clear: 'Limpiar',
    },
    row: 'Fila {{number}} · {{value}}',
    steps: {
      record: 'DevTools → ⚛️ Profiler → presiona el botón redondo de grabar.',
      press:
        'Presiona "Renderizar 60 filas lentas" y luego detén la grabación.',
      flame:
        'El flame chart muestra que SlowRow se lleva casi todo el tiempo. Settings → "Record why each component rendered" explica cada render.',
    },
  },
  performance: {
    title: 'Rendimiento',
    description:
      'Graba una línea de tiempo del trabajo de JS, los renders de React y tus propios User Timings.',
    replacement: {
      flipper: 'plugins de rendimiento',
      today: 'DevTools → Performance (RN 0.83+) · Dev Menu → Perf Monitor',
    },
    button: 'Correr 3M iteraciones',
    result: 'Tardó {{ms}} ms en el hilo de JS (suma {{sum}})',
    steps: {
      record: 'DevTools → Performance → graba (⏺).',
      press: 'Presiona el botón y luego detén la grabación.',
      find: 'Busca el bloque "Heavy work (demo)" en la pista Timings y la tarea larga en el hilo de JS.',
      fps: 'FPS en vivo en el dispositivo: Dev Menu → Perf Monitor.',
    },
  },
  debugger: {
    title: 'Breakpoints',
    description:
      'Pausa la app en una línea, inspecciona variables y avanza por el código paso a paso.',
    replacement: {
      flipper: 'plugin Hermes Debugger',
      today: 'DevTools → Sources',
    },
    total: 'Total con impuestos: ${{total}}',
    steps: {
      open: 'DevTools → Sources → `Ctrl+P` → escribe flipperDemos.',
      click:
        'Haz clic en el número de línea de "const line = item.price * item.qty".',
      press:
        'Presiona el botón: la app se pausa ahí. Pasa el cursor sobre item / total, usa Step over (F10) y Resume (F8).',
    },
  },
  storage: {
    title: 'Almacenamiento',
    description:
      'DevTools no tiene pestaña de almacenamiento, así que la app puede mostrar sus propios datos (e imprimirlos en la Console).',
    replacement: {
      flipper: 'AsyncStorage · Shared Preferences · Databases',
      today:
        'Visor dentro de la app / console.table · Android Studio → App Inspection',
    },
    buttons: {
      read: 'Leer AsyncStorage',
      write: 'Escribir una clave de prueba',
    },
    empty: 'AsyncStorage está vacío.',
    note: 'Los secretos de la bóveda están en Keychain / Keystore, no aquí. Los todos de SQLite (todos.sqlite) se pueden abrir en Android Studio → App Inspection → Database Inspector.',
  },
};

export default flipper;
