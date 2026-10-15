import type { Translation } from '../../types';
import type en from '../en/lists';

/** Spanish texts: lists. Same keys as ../en/lists.ts. */
const lists: Translation<typeof en> = {
  items_one: '{{formatted}} elemento',
  items_other: '{{formatted}} elementos',
  descriptions: {
    ScrollView:
      'Renderiza TODOS los elementos de una vez. Montaje lento y mucho uso de memoria con listas grandes.',
    FlatList:
      'Virtualiza: solo monta los elementos cerca del área visible y desmonta el resto.',
    FlashList:
      'Recicla las vistas que salen de la pantalla para renderizar las nuevas. Menos montajes, scroll más fluido.',
  },
  stats: {
    mountTime: 'Tiempo de montaje',
    jsFps: 'FPS de JS',
    mountedRows: 'Filas montadas',
  },
};

export default lists;
