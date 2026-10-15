import type { Translation } from '../../types';
import type en from '../en/rerenders';

/** Spanish texts: rerenders. Same keys as ../en/rerenders.ts. */
const rerenders: Translation<typeof en> = {
  sections: {
    why: '¿Por qué se vuelven a renderizar los componentes?',
    memoSubtitle: 'Evita el render de un hijo cuando sus props no cambiaron.',
    useCallbackSubtitle: 'Conserva la misma función entre renders.',
    useMemoSubtitle: 'Conserva un valor calculado o un objeto entre renders.',
    useRefSubtitle: 'Recuerda un valor sin renderizar.',
    whenToUse: 'Cuándo usar cada uno',
  },
  intro: {
    title: 'Un render es React llamando otra vez a tu componente',
    description:
      'Un componente se vuelve a renderizar cuando cambia su estado, cuando su padre se renderiza o cuando cambia un contexto que lee. Normalmente es barato; se vuelve un problema con árboles grandes, listas largas o cálculos lentos.',
    steps: {
      badges:
        'Cada caja de abajo muestra cuántas veces se ha renderizado y parpadea en amarillo en cada render.',
      columns:
        'Columna izquierda: el código ingenuo. Columna derecha: el mismo código con la optimización.',
      devTools:
        'Para verlo en cualquier pantalla: DevTools (`j` en Metro) → ⚛️ Profiler → ⚙️ → "Highlight updates when components render".',
    },
  },
  rules: {
    reactMemo:
      'Hijos que se renderizan seguido con las mismas props, o que son costosos (filas de listas, gráficas).',
    useCallback:
      'Funciones que pasas a hijos con memo o que usas como dependencias de efectos.',
    useMemo:
      'Cálculos costosos, y objetos / arrays que pasas a hijos con memo o a efectos.',
    useRef:
      'Valores que deben sobrevivir a los renders pero no se muestran: ids, timers, valores anteriores, vistas nativas.',
    noneTool: 'Ninguno',
    none: 'Componentes baratos. Memoizar también tiene un costo (comparar props, guardar valores viejos): mide primero.',
  },
  compilerNote:
    'React Compiler (React 19) puede agregar esta memoización automáticamente al compilar. Este proyecto no lo activa, así que los ejemplos se comportan como React normal.',

  render_one: 'render',
  render_other: 'renders',
  without: 'Sin',

  labels: {
    child: 'Hijo ({{name}})',
    parentTick: 'Padre (tick {{tick}})',
    parentLikes: 'Padre · {{likes}} likes',
    parent: 'Padre',
    parentDark: 'Padre (oscuro)',
    tapCounter: 'Contador de toques',
    form: 'Formulario',
  },
  memo: {
    description:
      'Cuando un padre se renderiza, todos sus hijos también, aunque sus props no hayan cambiado. memo hace que un hijo se salte ese render cuando sus props son iguales a las de la vez anterior.',
    withLabel: 'Con React.memo',
    rerenderParent: 'Re-renderizar padre',
    changeProp: 'Cambiar la prop del hijo',
    note: 'memo compara las props con Object.is (superficial). Solo ayuda si las props de verdad siguen iguales: las funciones, objetos y arrays creados durante el render son nuevos cada vez (mira las dos tarjetas siguientes).',
  },
  callback: {
    like: '👍 Me gusta',
    description:
      'Ambos hijos están envueltos en memo. A la izquierda el padre crea una nueva función onLike en cada render, así que memo no sirve de nada. useCallback conserva la misma función.',
    withLabel: 'Con useCallback',
    rerenderParents: 'Re-renderizar padres ({{tick}})',
    note: 'Tocar Me gusta también re-renderiza al padre (cambiaron los likes): a la izquierda el botón se vuelve a renderizar con él, a la derecha no. useCallback sin memo en el hijo no ahorra nada.',
  },
  calculation: {
    title: 'useMemo: cálculos costosos',
    description:
      'Filtrar y ordenar 40,000 nombres tarda un rato. Cambiar el tema re-renderiza a ambos padres, pero solo el de la izquierda repite el cálculo.',
    withLabel: 'Con useMemo',
    info: '{{matches}} coincidencias\ncalculado {{runs}}×, último {{ms}} ms',
    toggleTheme: 'Cambiar tema (estado no relacionado)',
    note: 'Cambiar el filtro recalcula en ambos lados: es lo esperado, la entrada cambió.',
  },
  objects: {
    title: 'useMemo: objetos y arrays estables',
    description:
      '{ … } y [ … ] escritos en el render son objetos nuevos cada vez. Un hijo con memo que los recibe siempre se re-renderiza. useMemo conserva el mismo objeto mientras sus entradas no cambien.',
    withLabel: 'Con useMemo',
    rerenderParents: 'Re-renderizar padres',
    changeColor: 'Cambiar color',
    note: 'Lo mismo pasa con {{style}} y {{data}} pasados a componentes con memo o a listas: saca las constantes del componente o memoízalas.',
  },
  refCounter: {
    title: 'useRef: valores que no se muestran',
    description:
      'El número de toques solo se manda a los logs. En el estado, cada toque re-renderiza el componente; en un ref, nada se renderiza hasta que pides mostrarlo.',
    withLabel: 'Con useRef',
    tap: 'Tocar',
    showCount: 'Mostrar conteo',
    count: 'Conteo: {{shown}} (actualizar)',
    note: 'Otros buenos usos de los refs: ids de timers y suscripciones, el valor anterior de una prop, banderas como "está cargando" y referencias a vistas nativas.',
  },
  refInput: {
    title: 'useRef: inputs no controlados',
    description:
      'Un input controlado (value + estado) se re-renderiza con cada tecla. Si solo necesitas el texto al enviar, guárdalo en un ref.',
    withLabel: 'Con useRef',
    placeholder: 'Escribe aquí',
    send: 'Enviar',
    sent: 'Enviar → "{{sent}}"',
    note: 'Usa estado cuando la UI depende del texto mientras escribes (validación, búsqueda en vivo, contador de caracteres).',
  },
};

export default rerenders;
