import type { Translation } from '../../types';
import type en from '../en/photos';

/** Spanish texts: photos. Same keys as ../en/photos.ts. */
const photos: Translation<typeof en> = {
  gallery: {
    caption_one: '{{count}} foto · guardada en este dispositivo',
    caption_other: '{{count}} fotos · guardadas en este dispositivo',
    empty:
      'Tu galería está vacía.\nAgrega una foto desde la cámara o tu galería.',
    add: '＋ Agregar foto',
    remove: 'Quitar foto',
  },
  picker: {
    title: 'Elige una foto',
    cancel: 'Cancelar',
    permissionDenied:
      'Permite el acceso a tus fotos para elegir una de la galería.',
    openSettings: 'Abrir Ajustes',
    noPhotos: 'No hay fotos en este dispositivo',
    addError: 'No se pudo agregar la foto',
  },
  camera: {
    allow: 'Permitir cámara',
    enableInSettings: 'Activa la cámara en Ajustes',
    unavailable: 'No hay cámara disponible',
    cancel: 'Cancelar',
    takePhoto: 'Tomar foto',
    flip: 'Cambiar cámara',
    captureError: 'No se pudo tomar la foto',
  },
};

export default photos;
