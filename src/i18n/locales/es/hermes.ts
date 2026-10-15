import type { Translation } from '../../types';
import type en from '../en/hermes';

/** Spanish texts: hermes. Same keys as ../en/hermes.ts. */
const hermes: Translation<typeof en> = {
  about: {
    section: '¿Qué es Hermes?',
    title: 'Un motor de JavaScript hecho para React Native',
    description:
      'React Native corre tu JavaScript dentro de un motor en el teléfono. Hermes, de Meta, es ese motor por defecto desde React Native 0.70.',
    steps: {
      bundle: 'Metro empaqueta todo tu JS (y node_modules) en un solo archivo.',
      compile:
        'En los builds de release, `hermesc` compila ese bundle a bytecode de Hermes.',
      launch:
        'Al abrir la app, Hermes carga el bytecode y lo interpreta en el hilo de JS.',
      jsi: 'Con JSI habla directamente con el código nativo (Fabric, TurboModules, Reanimated…) sin un bridge de JSON.',
    },
  },
  sections: {
    device: 'Este dispositivo',
    deviceSubtitle: 'Información en vivo del motor.',
    howItWorks: 'Cómo funciona',
    supports: 'Qué soporta',
    performance: 'Rendimiento y herramientas',
  },
  comparison: {
    section: 'Hermes vs un motor JIT',
    subtitle: 'JavaScriptCore (Safari) o V8 (Chrome).',
    hermes: 'Hermes',
    jit: 'Motor JIT',
    rows: {
      compiled: {
        topic: 'Cuándo se compila el JS',
        hermes: 'Al hacer el build (bytecode)',
        jit: 'En el dispositivo, al arrancar',
      },
      startup: {
        topic: 'Arranque',
        hermes: 'Rápido: el bytecode se mapea',
        jit: 'Más lento: primero parsea y compila',
      },
      memory: {
        topic: 'Memoria',
        hermes: 'Baja (sin cachés de código JIT)',
        jit: 'Más alta',
      },
      peakCpu: {
        topic: 'Velocidad máxima de CPU',
        hermes: 'Intérprete, sin JIT',
        jit: 'El JIT puede ser más rápido en ciclos intensivos',
      },
      appSize: {
        topic: 'Tamaño de la app',
        hermes: 'El bytecode es compacto',
        jit: 'Motor + código fuente en texto',
      },
      debugging: {
        topic: 'Depuración',
        hermes: 'CDP: React Native DevTools',
        jit: 'Safari / Chrome remoto',
      },
    },
    note: 'Hermes V1 (por defecto desde React Native 0.84) mejora todavía más el arranque, la memoria y la velocidad de ejecución sin cambiar código.',
  },
  engine: {
    title: '¿Qué motor está corriendo?',
    description:
      'HermesInternal solo existe en Hermes, así que es la forma común de detectarlo. Sus propiedades dicen el build exacto del motor.',
    hermes: '✅ Corriendo en Hermes',
    notHermes: '❌ No es Hermes (JSC o un test)',
    noProperties: 'No hay propiedades del runtime disponibles.',
    note: 'Se activa en android/gradle.properties con hermesEnabled=true (ya está activado). Desde React Native 0.84 el default es Hermes V1.',
  },
  bytecode: {
    title: 'Bytecode compilado por adelantado',
    description:
      'En los builds de release el JS se compila a bytecode de Hermes (.hbc) al generar el APK, así el teléfono no parsea ni compila JS al arrancar: solo mapea el archivo en memoria.',
    steps: {
      debug:
        'Debug: Metro manda JS normal; Hermes lo compila en el dispositivo (arranque más lento, necesario para Fast Refresh).',
      release:
        'Release: `hermesc` convierte index.android.bundle en bytecode al hacer el build.',
      launch:
        'Al abrir la app el bytecode se mapea en memoria: arranque más rápido y menos RAM. No hay JIT; Hermes interpreta el bytecode.',
    },
    note: 'En un build de release esto imprime "[bytecode]" en lugar del código fuente: el JS original no viaja dentro de la app.',
  },
  memory: {
    title: 'Memoria y garbage collection',
    description:
      'Hermes usa un garbage collector generacional y mayormente concurrente (Hades): los objetos jóvenes se recolectan rápido, y casi todo el trabajo de la generación vieja pasa fuera del hilo de JS.',
    heapSize: 'Tamaño del heap',
    allocated: 'Asignado (vivo)',
    collections: 'Recolecciones de basura',
    gcTime: 'Tiempo total de GC',
    onlyHermes: 'Las estadísticas de GC solo están disponibles en Hermes.',
    allocate: 'Crear 200k objetos',
    release: 'Liberar',
    note: 'Crea objetos unas cuantas veces y ve cómo crece el heap; libéralos y las siguientes recolecciones lo bajan. Para más detalle: DevTools → Memory → heap snapshot.',
  },
  eventLoop: {
    title: 'Event loop: microtareas vs timers',
    description:
      'Hermes corre las promesas de forma nativa. Las microtareas se ejecutan en cuanto termina el código actual, antes de cualquier timer, incluso uno de 0 ms.',
    run: 'Ejecutar',
    order: {
      syncStart: '1. síncrono: inicio',
      syncEnd: '2. síncrono: fin',
      promise: '3. Promise.then (microtarea)',
      microtask: '4. queueMicrotask (microtarea)',
      timeout: '5. setTimeout 0 (macrotarea)',
    },
  },
  features: {
    title: 'Soporte de JavaScript moderno',
    description:
      'Revisado en vivo en este dispositivo. Los built-ins que falten se pueden agregar con polyfills; la sintaxis la resuelven Babel y el compilador de Hermes.',
    summary: '{{supported}} de {{total}} soportadas',
  },
  intl: {
    title: 'Intl',
    description:
      'Hermes implementa Intl sobre los datos de idioma de la propia plataforma (ICU de Android / Foundation de iOS), así que no agrega megabytes a la app.',
    notSupported: 'no soportado ({{error}})',
  },
  benchmarks: {
    title: 'Benchmarks',
    description:
      'Hermes sacrifica velocidad máxima (sin JIT) a cambio de arranque rápido y poca memoria. Estos números son de este dispositivo; los builds de debug son mucho más lentos que los de release.',
    run: 'Correr benchmarks',
    running: 'Corriendo…',
    names: {
      fib: 'fib(27), llamadas recursivas',
      sort: 'Ordenar 200,000 números',
      json: 'JSON stringify + parse (20,000 objetos)',
      string: 'Construir un string de 1M de caracteres',
      map: 'Map con 100,000 claves',
    },
    details: {
      json: '{{mb}} MB, {{total}} elementos',
      string: '{{total}} caracteres',
      map: '{{total}} entradas',
    },
    note: 'Para comparar motores, pon hermesEnabled=false en gradle.properties, vuelve a compilar y córrelos otra vez (esta app está configurada para Hermes, así que hazlo solo como experimento).',
  },
  debugging: {
    title: 'Depuración y profiling',
    description:
      'Hermes trae un debugger integrado: React Native DevTools se conecta a él directamente (ve la pantalla Flipper → DevTools).',
    steps: {
      sources:
        'Presiona `j` en Metro → Sources: los breakpoints corren dentro de Hermes.',
      performance:
        'Pestaña Performance: el profiler por muestreo de Hermes (pilas de llamadas de JS a lo largo del tiempo).',
      memory:
        'Pestaña Memory: heap snapshots y líneas de tiempo de asignación del GC de Hermes.',
      crashes:
        'Crashes en release: Sentry simboliza los stack traces de Hermes con los source maps.',
    },
  },
};

export default hermes;
