import type { Translation } from '../../types';
import type en from '../en/share';

/** Spanish texts: share. Same keys as ../en/share.ts. */
const share: Translation<typeof en> = {
  error: 'Algo salió mal',
  actions: {
    share: 'Compartir',
    copy: 'Copiar',
    paste: 'Pegar',
  },
  text: {
    title: 'Texto',
    shareHint: 'Abre el menú de compartir para enviar este texto a otra app',
    copyHint: 'Copia este texto al portapapeles',
    copied: 'Texto copiado al portapapeles',
  },
  image: {
    title: 'Imagen',
    shareHint: 'Abre el menú de compartir para enviar esta imagen a otra app',
    copyHint: 'Copia esta imagen al portapapeles',
    copied: 'Imagen copiada al portapapeles',
    a11y: 'Foto aleatoria de Lorem Picsum',
  },
  clipboard: {
    title: 'Portapapeles',
    pasteHint: 'Muestra lo que hay ahora en el portapapeles',
    placeholder: 'Toca Pegar para ver lo que hay en el portapapeles ahora.',
    imageA11y: 'Imagen del portapapeles',
    empty: 'El portapapeles está vacío.',
  },
  tip: 'Tip: después de copiar, mantén presionado un campo de texto en otra app (Mensajes, Notas, WhatsApp…) y elige Pegar.',
  sheet: {
    textTitle: 'Compartir texto',
    imageTitle: 'Compartir imagen',
  },
};

export default share;
