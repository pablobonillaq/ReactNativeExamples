import type { Translation } from '../../types';
import type en from '../en/reanimated';

/** Spanish texts: reanimated. Same keys as ../en/reanimated.ts. */
const reanimated: Translation<typeof en> = {
  common: {
    play: 'Reproducir',
    pause: 'Pausar',
    start: 'Iniciar',
    stop: 'Detener',
    reset: 'Reiniciar',
    animate: 'Animar',
    add: 'Agregar',
    remove: 'Quitar',
  },
  screen: {
    intro:
      'Toda la API de Reanimated 3, corriendo en Reanimated {{version}} (v4 conserva todas las funciones de v3). Los gestos usan Gesture Handler 3. Todo se anima en el hilo de UI.',
    sections: {
      sharedValues: {
        title: '1. Shared values y hooks',
        subtitle: 'Estado que vive en el hilo de UI.',
      },
      animations: {
        title: '2. Animaciones',
        subtitle: 'Cómo llega un valor a su destino.',
      },
      modifiers: {
        title: '3. Modificadores',
        subtitle: 'Combina, repite, retrasa y limita animaciones.',
      },
      interpolation: {
        title: '4. Interpolación',
        subtitle: 'Convierte valores en posiciones, ángulos y colores.',
      },
      gestures: {
        title: '5. Gestos',
        subtitle: 'Hooks de Gesture Handler 3 + shared values.',
      },
      scroll: {
        title: '6. Scroll',
        subtitle: 'Eventos de scroll y refs nativas en worklets.',
      },
      layout: {
        title: '7. Animaciones de layout',
        subtitle: 'Anima el montaje, desmontaje y cambios de layout.',
      },
      threads: {
        title: '8. Hilos',
        subtitle: 'Worklets, frames y el hilo de UI.',
      },
      device: {
        title: '9. Dispositivo',
        subtitle: 'Sensores y teclado como shared values.',
      },
      extras: {
        title: '10. Extras de Reanimated 4',
        subtitle: 'No están en Reanimated 3: animaciones estilo CSS.',
      },
      reference: {
        title: 'Referencia de la API',
        subtitle: 'Todo lo anterior, de un vistazo.',
      },
    },
  },
  reference: {
    rows: {
      sharedValue: {
        api: 'useSharedValue · .value · get() · set() · modify()',
        where: '1. Shared values',
      },
      animatedStyle: { api: 'useAnimatedStyle', where: 'En todas partes' },
      derivedValue: { api: 'useDerivedValue', where: '1. Shared values' },
      animatedReaction: {
        api: 'useAnimatedReaction',
        where: '1. Shared values (y cada etiqueta de valor)',
      },
      animatedProps: {
        api: 'useAnimatedProps · createAnimatedComponent',
        where: '1. Shared values',
      },
      timing: {
        api: 'withTiming + Easing.* (in / out / inOut, bezier, steps)',
        where: '2. Animaciones',
      },
      spring: {
        api: 'withSpring (stiffness/damping, duration/dampingRatio, presets)',
        where: '2. Animaciones',
      },
      decay: {
        api: 'withDecay (clamp, rubberBandEffect)',
        where: '2. Animaciones, 5. Gestos',
      },
      animatable: {
        api: 'Animar colores y layout (width / height)',
        where: '2. Animaciones',
      },
      modifiers: {
        api: 'withSequence · withRepeat · withDelay · withClamp',
        where: '3. Modificadores',
      },
      cancel: {
        api: 'cancelAnimation · callbacks de animación (finished)',
        where: '3. Modificadores',
      },
      reduceMotion: {
        api: 'ReduceMotion · useReducedMotion · ReducedMotionConfig',
        where: '3. Modificadores',
      },
      interpolate: {
        api: 'interpolate · Extrapolation · clamp',
        where: '4. Interpolación',
      },
      interpolateColor: {
        api: 'interpolateColor (RGB / HSV / LAB)',
        where: '4. Interpolación',
      },
      gestures: {
        api: 'usePanGesture · useTapGesture · useLongPressGesture',
        where: '5. Gestos (RNGH 3)',
      },
      pinchRotate: {
        api: 'usePinchGesture · useRotationGesture',
        where: '5. Gestos (RNGH 3)',
      },
      combineGestures: {
        api: 'useExclusiveGestures · useSimultaneousGestures',
        where: '5. Gestos (RNGH 3)',
      },
      scrollHandler: {
        api: 'useAnimatedScrollHandler (todas las fases + contexto)',
        where: '6. Scroll, esta pantalla',
      },
      scrollRefs: {
        api: 'useAnimatedRef · useScrollOffset · scrollTo · measure',
        where: '6. Scroll',
      },
      entering: {
        api: 'Presets de entering / exiting + modificadores',
        where: '7. Animaciones de layout',
      },
      layoutTransitions: {
        api: 'Transiciones de layout (Linear, Sequenced, Fading, Jumping, Curved, EntryExit)',
        where: '7. Animaciones de layout',
      },
      keyframe: {
        api: 'Keyframe · LayoutAnimationConfig',
        where: '7. Animaciones de layout',
      },
      frameCallback: { api: 'useFrameCallback', where: '8. Hilos' },
      runOn: { api: "runOnUI · runOnJS · 'worklet'", where: '8. Hilos' },
      uiThread: { api: 'Hilo de UI vs hilo de JS', where: '8. Hilos' },
      sensor: { api: 'useAnimatedSensor', where: '9. Dispositivo' },
      keyboard: { api: 'useAnimatedKeyboard', where: '9. Dispositivo' },
      css: {
        api: 'Transiciones CSS · animaciones CSS · css.keyframes',
        where: '10. Extras de Reanimated 4',
      },
      notShown: {
        api: 'No se muestran: shared element transitions (experimental), useEvent / useHandler (eventos personalizados), createWorkletRuntime, PerformanceMonitor',
        where: 'Avanzado / experimental',
      },
    },
  },

  // ---------- 1. Shared values ----------
  sharedValue: {
    title: 'useSharedValue + useAnimatedStyle',
    description:
      'Un shared value vive en los dos hilos. Asignar .value (o llamar a set) actualiza el estilo en el hilo de UI sin re-renderizar React. get()/set() son las versiones de .value compatibles con React Compiler.',
  },
  derivedValue: {
    title: 'useDerivedValue',
    description:
      'Como useMemo, pero para shared values y en el hilo de UI. Las dos cajas de abajo se derivan de x.',
    animate: 'Animar x',
  },
  animatedReaction: {
    title: 'useAnimatedReaction + runOnJS',
    description:
      'Ejecuta un efecto secundario cuando algo cambia en el hilo de UI. Aquí cuenta cada vez que la caja cruza la mitad.',
    crossed_one: 'Cruzó la mitad {{count}} vez',
    crossed_other: 'Cruzó la mitad {{count}} veces',
    move: 'Mover',
    note: 'runOnJS es el nombre de Reanimated 3; Reanimated 4 también ofrece scheduleOnRN de react-native-worklets.',
  },
  animatedProps: {
    title: 'useAnimatedProps',
    description:
      'Anima props en lugar de estilos. Un contador que se dibuja 60 veces por segundo sin que React se re-renderice.',
    count: 'Contar hasta 1000',
  },

  // ---------- 2. Animations ----------
  timing: {
    title: 'withTiming',
    description:
      'Llega a toValue en un tiempo fijo siguiendo una curva de easing (por defecto: Easing.inOut(Easing.quad), 300 ms).',
    fixedNote: 'Esta curva se usa tal cual (in / out no aplican).',
  },
  spring: {
    title: 'withSpring',
    description:
      'Basada en física. Configúrala con stiffness/damping/mass, con duration/dampingRatio, o usa uno de los presets.',
    button: 'Resorte',
  },
  decay: {
    title: 'withDecay',
    description:
      'Sin destino: conserva la velocidad inicial (px/s) y se va frenando. Normalmente recibe la velocidad de un gesto al soltar (ve Gestos).',
    fling: 'Lanzar a 1600 px/s',
  },
  animatable: {
    title: 'Qué se puede animar',
    description:
      'Números, colores (strings) y props de layout como width / height (a diferencia del native driver de Animated, Reanimated anima el layout en el hilo de UI).',
    back: 'Regresar',
    change: 'Cambiar color, radio y tamaño',
  },

  // ---------- 3. Modifiers ----------
  sequence: {
    title: 'withSequence',
    description:
      'Ejecuta las animaciones en orden sobre el mismo shared value.',
    play: 'Reproducir secuencia',
  },
  repeat: {
    title: 'withRepeat + cancelAnimation',
    description:
      '-1 repite para siempre; `true` la reproduce de ida y vuelta. cancelAnimation detiene lo que esté corriendo sobre un valor.',
  },
  delay: {
    title: 'withDelay',
    description:
      'Envuelve cualquier animación y la inicia después de los ms indicados. Con retrasos distintos crea un efecto escalonado.',
    stagger: 'Escalonar con withDelay',
  },
  clamp: {
    title: 'withClamp',
    description:
      'El mismo resorte con rebote, con y sin límite. El limitado nunca pasa la marca.',
    springBoth: 'Animar ambos con resorte',
  },
  reduceMotion: {
    title: 'ReduceMotion',
    description:
      "Con 'Quitar animaciones' activado en el sistema, las animaciones con ReduceMotion.System saltan directo al final. Always / Never lo ignoran.",
    status: 'useReducedMotion(): {{value}}',
    reduced: 'true (reducido)',
    note: 'Envuelve un árbol en <ReducedMotionConfig mode={…} /> para aplicarlo a todas las animaciones de adentro.',
  },

  // ---------- 4. Interpolation ----------
  interpolate: {
    title: 'interpolate',
    description:
      'Una función normal que llamas dentro de un worklet: convierte un número de un rango a otro. Los ángulos se arman como strings.',
  },
  extrapolation: {
    title: 'Extrapolation',
    description:
      'El valor va de 0 → 2 pero el inputRange termina en 1 (línea punteada). EXTEND sigue de largo, CLAMP se detiene, IDENTITY devuelve la entrada tal cual.',
    animate: 'Animar 0 → 2',
    note: 'Cada lado puede ser distinto: { extrapolateLeft: CLAMP, extrapolateRight: EXTEND }.',
  },
  interpolateColor: {
    title: 'interpolateColor',
    description:
      'De rojo → azul en tres espacios de color. RGB pasa por un morado turbio, HSV por el arcoíris y LAB se ve más parejo.',
    blend: 'Mezclar',
  },
  clampFunction: {
    title: 'clamp',
    description:
      'Un helper para worklets. x recorre toda la pista, pero la caja se queda entre las dos líneas.',
    run: 'Llevar x de 0 a W',
  },

  // ---------- 5. Gestures ----------
  panDecay: {
    title: 'Pan + withDecay',
    description:
      'Arrastra y lanza la pelota. Cada callback es un worklet: el gesto nunca toca el hilo de JS.',
    note: 'Un resorte dentro de useAnimatedStyle (scale) se anima solo cuando cambia el valor del que depende.',
  },
  tap: {
    title: 'Toque / doble toque / pulsación larga',
    description:
      'Exclusivo: el primer gesto gana si puede; los siguientes esperan a que falle. useSimultaneousGestures y useCompetingGestures son las otras dos formas de combinarlos.',
    results: {
      initial: 'Toca, toca dos veces o mantén presionada la caja',
      singleTap: 'Un toque → rebote',
      doubleTap: 'Doble toque → giro',
      longPress: 'Pulsación larga (500 ms) → color',
    },
  },
  pinchRotate: {
    title: 'Pellizcar + rotar + arrastrar (simultáneo)',
    description:
      'Usa dos dedos para hacer zoom y rotar, uno para mover. En el emulador: mantén Ctrl (Cmd en Mac) y arrastra para pellizcar.',
  },

  // ---------- 6. Scroll ----------
  scrollHandler: {
    title: 'useAnimatedScrollHandler',
    description:
      'Cada handler es un worklet. El objeto context se comparte entre ellos (aquí: dónde empezó el arrastre).',
    phases: {
      swipe: 'Desliza las tarjetas',
      beginDrag: 'onBeginDrag',
      endDrag: 'onEndDrag: arrastraste {{value}} px',
      momentumBegin: 'onMomentumBegin',
      momentumEnd: 'onMomentumEnd: tarjeta {{value}}',
    },
  },
  scrollTo: {
    title: 'useAnimatedRef · useScrollOffset · scrollTo · measure',
    description:
      'Una ref animada da a los worklets acceso a la vista nativa: lee su posición de scroll, desplázala o mídela sin ir y volver a JS.',
    row: 'Fila {{number}}',
    top: 'scrollTo arriba',
    measureMe: 'mídeme',
    note: 'measure devuelve coordenadas de pantalla (pageX / pageY) y el tamaño.',
  },

  // ---------- 7. Layout animations ----------
  enteringExiting: {
    title: 'entering / exiting',
    description:
      'Las animaciones de layout corren cuando la vista se agrega o se quita del árbol. No necesitas shared values.',
    remove: 'Quitar (exiting)',
    add: 'Agregar (entering)',
  },
  layoutTransition: {
    title: 'Transiciones de layout',
    description:
      'Cuando se agrega o quita un elemento, los demás se mueven a su nuevo lugar con la transición elegida. Toca un elemento para quitarlo.',
    addAtStart: 'Agregar al inicio',
    shuffle: 'Revolver',
  },
  keyframe: {
    title: 'Keyframe',
    description:
      'Tu propia animación de layout, definida con keyframes estilo CSS. Cada paso puede tener su propio easing.',
  },
  layoutAnimationConfig: {
    title: 'LayoutAnimationConfig',
    description:
      'Útil para listas cuyos elementos no deben animarse en el primer render. Vuelve a montar la fila para comparar.',
    remount: 'Volver a montar',
    note: 'Las shared element transitions (sharedTransitionTag) son experimentales en Reanimated 4 y necesitan un feature flag, por eso no se muestran aquí.',
  },

  // ---------- 8. Threads ----------
  frameCallback: {
    title: 'useFrameCallback',
    description:
      'Un worklet que se llama en cada frame con datos de tiempo. Aquí: gravedad y rebotes calculados a mano, más de 60 veces por segundo, en el hilo de UI.',
  },
  threadHop: {
    title: "runOnUI · runOnJS · 'worklet'",
    description:
      "Los worklets son funciones marcadas con 'worklet' (o usadas dentro de hooks de Reanimated): pueden correr en el hilo de UI. runOnJS vuelve a llamar a React.",
    pressTheButton: 'Presiona el botón',
    result:
      'El hilo de UI calculó {{value}} (el worklet corrió en: {{thread}})',
    runs: 'ejecuciones',
    sum: 'Sumar 1…1000 en el hilo de UI',
    note: 'Reanimated 4 también exporta scheduleOnUI / scheduleOnRN desde react-native-worklets, y createWorkletRuntime para runtimes en segundo plano.',
  },
  uiThread: {
    title: 'Hilo de UI vs hilo de JS',
    description:
      'Inicia ambos y luego bloquea JavaScript por 2 segundos. La caja de Reanimated sigue moviéndose; la que maneja el estado de React se congela.',
    jsLane: 'Estado de React + setInterval (hilo de JS)',
    uiLane: 'Reanimated (hilo de UI)',
    blocking: 'Bloqueando el hilo de JS…',
    startBoth: 'Iniciar ambos',
    block: 'Bloquear JS por 2 s',
  },

  // ---------- 9. Device ----------
  sensor: {
    title: 'useAnimatedSensor',
    description:
      'Inclina el teléfono para rodar la pelota. Las lecturas del sensor llegan al hilo de UI, listas para estilos animados. ROTATION da yaw / pitch / roll en lugar de x / y / z.',
    available: 'Sensor disponible',
    notAvailable: 'El sensor no está disponible aquí',
    note: 'En el emulador: ⋯ (Extended controls) → Virtual sensors → mueve el dispositivo.',
  },
  keyboard: {
    title: 'useAnimatedKeyboard',
    description:
      'Sigue exactamente la animación del teclado (sin eventos keyboardWillShow). Toca el campo: la barra crece con la altura del teclado.',
    placeholder: 'Toca para abrir el teclado',
  },

  // ---------- 10. Reanimated 4 extras ----------
  cssTransition: {
    title: 'Transiciones CSS (Reanimated 4)',
    description:
      'Solo cambia el estilo con estado de React: Reanimated anima las propiedades listadas hasta el nuevo valor.',
    toggle: 'Alternar estilo',
  },
  cssAnimation: {
    title: 'Animaciones CSS (Reanimated 4)',
    description:
      'Keyframes declarados en el estilo, como @keyframes de CSS. El estado de reproducción, la dirección y el número de repeticiones son props de estilo normales.',
    note: 'No es parte de Reanimated 3: las animaciones y transiciones CSS se agregaron en Reanimated 4.',
  },
};

export default reanimated;
