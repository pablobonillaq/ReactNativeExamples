import type { Translation } from '../../types';
import type en from '../en/animated';

/** Spanish texts: animated. Same keys as ../en/animated.ts. */
const animated: Translation<typeof en> = {
  intro:
    'Todas las opciones de la API Animated del núcleo de React Native. Cada tarjeta muestra la llamada que usa; presiona los botones para verla moverse.',
  sections: {
    values: {
      title: '1. Valores',
      subtitle: 'Lo que se anima: números fuera del estado de React.',
    },
    types: {
      title: '2. Tipos de animación',
      subtitle: 'Cómo se mueve un valor de A a B.',
    },
    easing: {
      title: '3. Easing',
      subtitle: 'La forma de una animación timing.',
    },
    composition: {
      title: '4. Composición',
      subtitle: 'Ejecuta varias animaciones juntas o en orden.',
    },
    interpolation: {
      title: '5. Interpolación',
      subtitle: 'Convierte un valor en posiciones, ángulos, colores…',
    },
    combining: {
      title: '6. Combinar valores',
      subtitle: 'Operaciones entre valores animados.',
    },
    events: {
      title: '7. Eventos y gestos',
      subtitle: 'Pasa el scroll y los toques directo a los valores.',
    },
    nativeDriver: {
      title: '8. Native driver',
      subtitle: 'Dónde corre la animación: hilo de JS o hilo de UI.',
    },
    components: {
      title: '9. Componentes animados',
      subtitle: 'Qué componentes aceptan valores animados.',
    },
    reference: {
      title: 'Referencia de la API',
      subtitle: 'Todo lo anterior, de un vistazo.',
    },
  },
  scroll: {
    title: 'Scroll: Animated.event',
    description:
      'La barra morada de arriba de esta pantalla es scaleX = scrollY interpolado a 0 → 1 (con clamp).',
    direction: 'listener dice que haces scroll hacia {{direction}}',
    up: 'arriba',
    down: 'abajo',
  },
  reference: {
    values: 'Valores',
    valuesGestures: 'Valores, Gestos',
    valueLabels: 'Valores (etiquetas de valor)',
    valuesComposition: 'Valores, Composición',
    types: 'Tipos de animación',
    typesGestures: 'Tipos de animación, Gestos',
    easing: 'Easing',
    composition: 'Composición',
    interpolation: 'Interpolación',
    combining: 'Combinar valores',
    events: 'Eventos (barra de progreso)',
    gestures: 'Gestos',
    nativeDriver: 'Native driver',
    everywhere: 'En todas partes',
    sameAsView: 'Igual que View, para esos componentes',
    components: 'Componentes',
    advanced:
      'Avanzado: agrega o conecta handlers extra a un Animated.event (lo usan las librerías)',
  },
  value: {
    description:
      'Un número que vive fuera del estado de React: cambiarlo mueve la vista sin re-render. setValue salta; las animaciones lo mueven con el tiempo. El offset se suma encima del valor (value + offset); flattenOffset lo integra.',
  },
  valueXY: {
    description:
      'Junta dos Animated.Values. getTranslateTransform() lo convierte en [{ translateX }, { translateY }]; getLayout() en { left, top }.',
    random: 'Punto al azar (spring)',
  },
  color: {
    description:
      "Un color cuyos canales r, g, b y a son Animated.Values. setValue('blue') salta; animar los canales los mezcla.",
    names: {
      indigo: 'índigo',
      pink: 'rosa',
      green: 'verde',
      amber: 'ámbar',
    },
  },
  control: {
    title: 'Controlar una animación en curso',
    description:
      'La etiqueta de valor de abajo usa addListener. stopAnimation congela el valor donde está y te lo devuelve en un callback; resetAnimation lo regresa a donde empezó.',
    start: 'Iniciar',
    messages: {
      idle: 'Presiona iniciar: tarda 4 s',
      running: 'En curso…',
      finished: 'Terminó (finished: true)',
      interrupted: 'Interrumpida (finished: false)',
      stopped: 'Detenida en {{value}}',
      reset: 'Reiniciada a {{value}}',
      animReset: 'animation.reset(): de vuelta al valor inicial',
    },
    note: 'Iniciar una animación nueva sobre un valor detiene la que ya corre en él.',
  },
  timing: {
    description:
      'Llega a toValue en exactamente `duration` ms siguiendo una curva de easing. La animación más común.',
    animate: 'Animar',
    animateBack: 'Animar de regreso',
  },
  spring: {
    description:
      'Simula un resorte: se pasa del destino y luego se asienta. Usa solo una de las tres configuraciones.',
    spring: 'Resorte',
    springBack: 'Resorte de regreso',
  },
  decay: {
    description:
      'Sin valor destino: sigue moviéndose y se frena, como una lista que deslizas con fuerza. Normalmente se alimenta con la velocidad de un gesto.',
    throw: 'Lanzar',
  },
  easing: {
    description:
      'Un easing convierte el tiempo (0→1) en progreso (0→1). Easing.in / out / inOut invierten o reflejan cualquier curva.',
    fixed: 'Esta curva se usa tal cual (in / out no aplican).',
    play: 'Reproducir 1.2 s',
  },
  sequence: {
    description:
      'Inicia cada animación cuando termina la anterior. Si una se detiene, las demás no corren.',
    play: 'Reproducir secuencia',
  },
  parallel: {
    description:
      'Las inicia todas al mismo tiempo (aquí con duraciones distintas). Con stopTogether: true, detener una las detiene todas.',
    play: 'Reproducir en paralelo',
    stopLane: 'Detener carril 1',
  },
  stagger: {
    description:
      'Como parallel, pero cada animación empieza 120 ms después de la anterior. Ideal para listas y menús.',
    up: 'Stagger hacia arriba',
    down: 'Stagger hacia abajo',
  },
  delay: {
    description:
      'Una animación que no hace nada durante el tiempo indicado. También existe como la opción `delay` de timing y spring.',
    run: 'Ir, esperar 1 s, regresar',
  },
  loop: {
    description:
      'Repite la animación; iterations: -1 significa para siempre. Con el native driver el loop corre completo en el hilo de UI.',
    infinite: 'infinito',
    start: 'Iniciar loop',
    stop: 'Detener',
  },
  interpolate: {
    description:
      "Mapea rangos: números, ángulos ('360deg'), colores (hex / rgb) y varios puntos intermedios. Un solo valor mueve, gira, escala, cambia de color y redondea la caja.",
    toOne: 'Animar a 1',
    toZero: 'Regresar a 0',
  },
  extrapolate: {
    description:
      'El valor va de 0 a 2, pero el inputRange termina en 1. La línea punteada es donde cae el 1.',
    note: 'extend sigue de largo, clamp se detiene en la última salida, identity devuelve la entrada tal cual (aquí 0 → 2 px, así que casi no se mueve).',
    hint: 'extrapolateLeft / extrapolateRight configuran cada lado por separado.',
    run: 'Animar 0 → 2 → 0',
  },
  math: {
    title: 'Combinar valores',
    description:
      'Cada caja de abajo la mueve el mismo x (0 → W → 0). La negra es x tal cual.',
    mirrored: 'reflejado',
    wraps: 'da la vuelta',
    note: 'diffClamp sigue los cambios de x pero nunca sale de [0, 60]: cuando x cambia de dirección reacciona de inmediato. Es el truco detrás de los headers que se ocultan al hacer scroll hacia abajo y aparecen al hacer scroll hacia arriba.',
    run: 'Animar x',
  },
  drag: {
    title: 'Arrastrar: Animated.event + PanResponder',
    description:
      'Animated.event escribe los valores del gesto o del scroll directo en valores Animated. Arrastra la caja; se queda donde la sueltes.',
    box: 'arrastra',
    reset: 'Restablecer posición',
  },
  throw: {
    title: 'Lanzar: velocidad del gesto + decay + spring',
    description:
      'Lanza la pelota: conserva la velocidad de tu dedo, se frena y regresa con un resorte.',
    note: 'PanResponder corre en el hilo de JS, así que aquí Animated.event no puede usar el native driver. react-native-gesture-handler + Reanimated mueven los gestos al hilo de UI.',
  },
  nativeDriver: {
    description:
      'Inicia ambas y luego bloquea el hilo de JS 2 segundos: la caja movida por JS se congela, la movida por el driver nativo sigue.',
    jsTrack: 'useNativeDriver: false (hilo de JS)',
    nativeTrack: 'useNativeDriver: true (hilo de UI)',
    blocking: 'Bloqueando el hilo de JS…',
    stop: 'Detener',
    start: 'Iniciar ambas',
    block: 'Bloquear JS 2 s',
    note: 'El native driver soporta props que no afectan el layout: transform y opacity (y colores en versiones recientes). width, height, margin, top/left… necesitan useNativeDriver: false.',
  },
  createComponent: {
    description:
      'Integrados: Animated.View, Text, Image, ScrollView, FlatList y SectionList. Cualquier otro pasa por createAnimatedComponent.',
    pressMe: 'Presióname ({{presses}})',
  },
  text: {
    description:
      'Las props de texto que cambian el layout (fontSize, letterSpacing) solo funcionan con useNativeDriver: false.',
    grow: 'Agrandar',
    shrink: 'Encoger',
    note: 'Los valores animados no se pueden imprimir como texto: usa addListener.',
  },
};

export default animated;
