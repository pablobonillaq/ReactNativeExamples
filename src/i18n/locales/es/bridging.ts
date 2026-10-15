import type { Translation } from '../../types';
import type en from '../en/bridging';

/** Spanish texts: bridging. Same keys as ../en/bridging.ts. */
const bridging: Translation<typeof en> = {
  sections: {
    what: '¿Qué es el bridging?',
    oldVsJsi: 'El bridge viejo vs JSI',
    oldVsJsiSubtitle:
      'Por qué React Native reemplazó el bridge con la Nueva Arquitectura.',
    jsToNative: 'JS → nativo',
    jsToNativeSubtitle: 'Tres formas de llamar código nativo desde JavaScript.',
    nativeToJs: 'Nativo → JS',
    nativeToJsSubtitle: 'El código nativo toma la iniciativa.',
    data: 'Datos que cruzan la frontera',
    dataSubtitle: 'Qué les pasa a los valores y errores en el camino.',
    performance: 'Rendimiento',
    otherKinds: 'Otros tipos de bridging',
  },
  intro: {
    title: 'Dos mundos que necesitan hablar',
    description:
      'Tu código de React corre como JavaScript en Hermes. La cámara, los sensores, el almacenamiento y las vistas reales de la pantalla viven en código nativo. El bridging es cómo cada lado llama al otro y convierte los datos entre ellos.',
    steps: {
      spec: 'Describes el módulo en TypeScript: `specs/NativeBridgeDemo.ts`.',
      codegen:
        'Al compilar, Codegen convierte esa spec en código de unión en C++ más una clase base en Kotlin y un protocolo en Objective-C.',
      implement:
        'Lo implementas en nativo: `NativeBridgeDemoModule.kt` y `RCTNativeBridgeDemo.mm`.',
      use: 'JS lo obtiene con `TurboModuleRegistry.get(…)` y llama sus métodos como en cualquier objeto.',
    },
  },
  status: {
    loaded:
      '✓ NativeBridgeDemo está cargado ({{os}}). Prueba los demos de abajo.',
    missing:
      '✗ NativeBridgeDemo no está en la app instalada. El código nativo necesita un build nuevo: corre `npm run android` (recargar Metro no basta).',
  },
  comparison: {
    oldBridge: 'Bridge viejo',
    newArchitecture: 'Nueva Arquitectura',
    rows: {
      travel: {
        topic: 'Cómo viajan las llamadas',
        bridge: 'Serializadas a JSON, encoladas y enviadas en lotes',
        jsi: 'Llamadas directas a C++ por JSI, sin JSON',
      },
      sync: {
        topic: 'Llamadas síncronas',
        bridge: 'No (solo asíncronas)',
        jsi: 'Sí, cuando el método devuelve un valor',
      },
      types: {
        topic: 'Tipos',
        bridge: 'Se revisan en tiempo de ejecución (o nunca)',
        jsi: 'Spec tipada; Codegen la revisa al compilar',
      },
      loading: {
        topic: 'Carga',
        bridge: 'Todos los módulos al arrancar',
        jsi: 'Bajo demanda, la primera vez que JS lo usa',
      },
      views: {
        topic: 'Vistas nativas',
        bridge: 'Paper (UIManager)',
        jsi: 'Fabric (renderer en C++)',
      },
      reactNative: {
        topic: 'En React Native',
        bridge: 'Por defecto hasta 0.75',
        jsi: 'Por defecto desde 0.76; la única en 0.82+',
      },
    },
    note: 'La gente sigue diciendo "bridging" para cualquier comunicación JS ⇄ nativo, aunque hoy pasa por JSI y ya no hay bridge.',
  },
  otherKinds: {
    nativeUi: {
      title: 'Componentes de UI nativos',
      description:
        'Una vista nativa usada como componente de React (Fabric + codegenNativeComponent). En esta app: el mapa de MapLibre y la vista previa de la cámara.',
    },
    legacy: {
      title: 'Módulos nativos legacy',
      description:
        'Los módulos escritos para el bridge viejo (NativeModules.X) siguen funcionando con la capa de interop, pero se recomienda migrarlos a Turbo Modules.',
    },
    cxx: {
      title: 'Turbo Modules en C++',
      description:
        'Una sola implementación en C++ compartida por Android e iOS, llamada por JSI.',
    },
    nitro: {
      title: 'Nitro Modules',
      description:
        'Framework de JSI de terceros (aquí lo usa react-native-nitro-image): "hybrid objects" tipados en Swift, Kotlin o C++.',
    },
    expo: {
      title: 'Expo Modules',
      description:
        'Módulos en Swift / Kotlin con una API declarativa (Function, AsyncFunction, Events), instalables en cualquier app de React Native.',
    },
    hostFunctions: {
      title: 'Host functions de JSI',
      description:
        'Funciones de C++ instaladas directamente en el runtime de JS. Reanimated y los worklets las usan para correr JS en el hilo de UI.',
    },
    note: 'Otro ejemplo en esta app: Todo list (Turbo Native Module) guarda sus datos con la misma técnica. Guía: docs/NATIVE_MODULES.md.',
  },

  buttons: {
    currentThread: 'Llamar currentThread()',
    asyncThread: 'Llamar asyncThread() y addAsync()',
    withCallback: 'Llamar withCallback(21, …)',
    fail: 'Llamar fail()',
  },
  missing:
    'Módulo nativo no disponible: vuelve a compilar la app (npm run android).',
  sync: {
    title: 'Llamada síncrona',
    description:
      'JS llama a {{language}} y recibe el valor en la misma línea, como una función normal. Corre en el hilo de JS, así que debe ser rápida: mientras corre, JS está bloqueado.',
  },
  async: {
    title: 'Llamada asíncrona (Promise)',
    description:
      'El método devuelve una Promise. El código nativo lo corre en un hilo en segundo plano y la resuelve después, así que el hilo de JS sigue trabajando. Úsala para cualquier cosa lenta: disco, red, criptografía.',
    otherThread: 'Una llamada síncrona corrió en "{{thread}}": otro hilo.',
  },
  callback: {
    title: 'Callback',
    description:
      'JS pasa una función; el código nativo la llama con el resultado. Un callback solo se puede llamar una vez. Las Promises suelen ser más cómodas; los callbacks quedan para APIs más viejas.',
  },
  events: {
    title: 'Eventos: nativo → JS',
    description:
      'Aquí la iniciativa es nativa: un timer de {{language}} manda un evento cada 500 ms. Se usa para sensores, descargas, notificaciones push… Siempre quita la suscripción cuando se cierra la pantalla.',
    tickInfo:
      'enviado desde el hilo "{{thread}}"\nllegó {{latency}} ms después de que nativo lo creó',
  },
  types: {
    title: 'Conversión de tipos',
    description:
      'JS y {{language}} tienen tipos distintos. Codegen convierte cada valor; {{language}} responde lo que recibió.',
    send: 'Enviar el objeto',
    note: 'Fíjate que 42 llega como número decimal: JS tiene un solo tipo de número. Las specs tipadas (string, number, boolean, objetos) las revisa Codegen al compilar; UnsafeObject se salta esa revisión.',
  },
  errors: {
    title: 'Errores',
    description:
      'El código nativo rechaza la Promise con un código y un mensaje; JS recibe un Error normal que puedes atrapar con catch. Usa códigos para distinguir errores (E_NOT_FOUND, E_PERMISSION…).',
  },
  benchmark: {
    title: 'Costo de cruzar',
    description:
      'El mismo trabajo pequeño hecho de tres formas. Cruzar a nativo tiene un costo, y una llamada asíncrona agrega un salto de hilo y una Promise. Agrupa el trabajo en pocas llamadas en lugar de muchas pequeñas.',
    running: 'Ejecutando…',
    run: 'Ejecutar {{calls}} llamadas de cada una',
    names: {
      js: 'Función de JS normal',
      sync: 'add() nativo síncrono',
      async: 'addAsync() nativo asíncrono',
    },
    bar: '{{name}}: {{perCall}} µs / llamada ({{total}} en total)',
    note: 'Los números varían mucho entre dispositivos, y los builds de debug son mucho más lentos que los de release.',
  },
};

export default bridging;
