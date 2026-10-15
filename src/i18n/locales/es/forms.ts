import type { Translation } from '../../types';
import type en from '../en/forms';

/** Spanish texts: forms. Same keys as ../en/forms.ts. */
const forms: Translation<typeof en> = {
  textField: {
    counterA11y: '{{length}} de {{max}} caracteres',
  },
  selectField: {
    placeholder: 'Elige una opción',
  },
  dateField: {
    placeholder: 'Elige una fecha',
    hint: 'Abre un calendario para elegir una fecha',
    notSelected: 'Sin seleccionar',
    cancel: 'Cancelar',
    cancelHint: 'Cierra el calendario sin cambiar la fecha',
    done: 'Listo',
    doneHint: 'Guarda la fecha seleccionada',
  },
  person: {
    name: {
      label: 'Nombre',
      placeholder: 'Juan Pérez',
    },
    birthDate: {
      label: 'Fecha de nacimiento',
    },
    phone: {
      label: 'Teléfono',
      placeholder: '+52 55 1234 5678',
    },
    email: {
      label: 'Correo electrónico',
      placeholder: 'juan@ejemplo.com',
    },
    address: {
      label: 'Dirección',
      placeholder: 'Av. Reforma 222, CDMX',
    },
    color: {
      label: 'Color',
      placeholder: 'Elige un color',
      options: {
        red: 'rojo',
        blue: 'azul',
        yellow: 'amarillo',
      },
    },
    comments: {
      label: 'Comentarios',
      placeholder: '¿Algo más que quieras contarnos?',
    },
    submit: 'Enviar',
    submitted: 'Información enviada',
  },
  validation: {
    nameRequired: 'El nombre es obligatorio',
    nameMin: 'El nombre debe tener al menos {{min}} caracteres',
    birthDateRequired: 'La fecha de nacimiento es obligatoria',
    birthDateFuture: 'La fecha de nacimiento no puede estar en el futuro',
    adult: 'Debes tener al menos {{age}} años',
    phoneRequired: 'El teléfono es obligatorio',
    phoneFormat: 'Solo dígitos, espacios, guiones y un + al inicio',
    phoneLength: 'El teléfono debe tener entre {{min}} y {{max}} dígitos',
    emailRequired: 'El correo electrónico es obligatorio',
    emailInvalid: 'Escribe un correo electrónico válido',
    addressRequired: 'La dirección es obligatoria',
    colorInvalid: 'Elige un color válido',
    commentsMax: 'Los comentarios no pueden pasar de {{max}} caracteres',
  },
};

export default forms;
