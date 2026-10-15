import type { Translation } from '../../types';
import type en from '../en/buses';

/** Spanish texts: buses. Same keys as ../en/buses.ts. */
const buses: Translation<typeof en> = {
  status: {
    live_one: 'En vivo · {{count}} camión · Calzada Independencia',
    live_other: 'En vivo · {{count}} camiones · Calzada Independencia',
    updated: 'Actualizado hace {{seconds}} s · cada {{interval}} s',
  },
  detail: {
    north: '↑ Hacia el norte (a Huentitán)',
    south: '↓ Hacia el sur (a Agua Azul)',
    stopped: 'Detenido',
    info: '{{state}} · a {{km}} km del extremo sur',
    showAll: 'Ver todos',
  },
  chip: {
    stopped: 'parado',
  },
  speed: '{{speed}} km/h',
};

export default buses;
