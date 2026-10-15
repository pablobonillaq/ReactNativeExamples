import type { Translation } from '../../types';
import type en from '../en/common';

/** Spanish texts: common. Same keys as ../en/common.ts. */
const common: Translation<typeof en> = {
  actions: {
    add: 'Agregar',
    cancel: 'Cancelar',
    clear: 'Limpiar',
    close: 'Cerrar',
    delete: 'Eliminar',
    edit: 'Editar',
    ok: 'Aceptar',
    retry: 'Reintentar',
    save: 'Guardar',
    tryAgain: 'Intentar de nuevo',
  },
  states: {
    loading: 'Cargando…',
    error: 'Algo salió mal',
    empty: 'Aún no hay nada aquí',
  },
  a11y: {
    openSettings: 'Abrir ajustes',
    openSettingsHint: 'Abre el menú lateral para cambiar el idioma y el tema',
  },
};

export default common;
