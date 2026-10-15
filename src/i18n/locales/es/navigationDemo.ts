import type { Translation } from '../../types';
import type en from '../en/navigationDemo';

/** Spanish texts: navigationDemo. Same keys as ../en/navigationDemo.ts. */
const navigationDemo: Translation<typeof en> = {
  exit: 'Salir',
  menu: {
    drawer: 'Drawer',
    tabs: 'Tabs',
    stack: 'Stack',
  },
  drawer: {
    title: 'Navegación con drawer',
    description:
      'Un menú lateral que se desliza desde la izquierda. Ábrelo con el botón ☰ o deslizando desde el borde izquierdo.',
    button: 'Abrir el detalle desde el drawer',
    source: 'Navegación con drawer',
    detailTitle: 'Hola desde el drawer',
  },
  tabs: {
    source: 'Navegación con tabs',
    one: {
      tabTitle: 'Tab 1',
      title: 'Navegación con tabs · Tab 1',
      description:
        'Las tabs inferiores mantienen montada cada pantalla y te dejan cambiar entre ellas con la barra de abajo.',
      button: 'Abrir el detalle desde la tab 1',
      detailTitle: 'Hola desde la primera tab',
    },
    two: {
      tabTitle: 'Tab 2',
      title: 'Navegación con tabs · Tab 2',
      description:
        'El mismo destino, distintos params: el detalle muestra otro título y otra imagen.',
      button: 'Abrir el detalle desde la tab 2',
      detailTitle: 'Hola desde la segunda tab',
    },
  },
  stack: {
    title: 'Navegación con stack',
    description:
      'Las pantallas se apilan una encima de otra. Este stack vive dentro del drawer, así que el detalle se abre aquí con su propio botón de regresar.',
    button: 'Agregar el detalle a este stack',
    source: 'Navegación con stack',
    detailTitle: 'Hola desde el stack',
  },
  detail: {
    headerTitle: 'Header modificado desde {{source}}',
    openedFrom: 'Abierto desde: {{source}}',
    paramsLabel: 'Params de navegación',
  },
};

export default navigationDemo;
