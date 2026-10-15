import type { Translation } from '../../types';
import type en from '../en/accessibility';

/** Spanish texts: accessibility. Same keys as ../en/accessibility.ts. */
const accessibility: Translation<typeof en> = {
  status: {
    a11yOn: '{{reader}} está activado',
    a11yOff: '{{reader}} está desactivado',
    on: '{{reader}} está ACTIVADO',
    off: '{{reader}} está DESACTIVADO — actívalo para probar esta pantalla',
  },
  title: 'Formulario accesible',
  imageLabel: 'Foto aleatoria de un paisaje de Lorem Picsum',
  name: {
    label: 'Nombre',
    placeholder: 'Juan Pérez',
    hint: 'Escribe tu nombre completo',
  },
  date: {
    label: 'Fecha',
    hint: 'Abre un calendario para elegir la fecha',
  },
  submit: {
    label: 'Enviar',
    hint: 'Envía el formulario',
  },
  errors: {
    nameRequired: 'El nombre es obligatorio',
    dateRequired: 'La fecha es obligatoria',
    announce_one: 'El formulario tiene {{count}} error',
    announce_other: 'El formulario tiene {{count}} errores',
  },
  submitted: {
    title: 'Información enviada',
    message: 'Enviado: {{name}}, {{date}}',
    announce: 'Información enviada. {{message}}',
  },
  tips: {
    title: 'Cómo probarlo',
    ios: '• iOS: Ajustes › Accesibilidad › VoiceOver. Desliza a la derecha/izquierda para moverte y toca dos veces para activar.',
    android:
      '• Android: Configuración › Accesibilidad › TalkBack. Desliza a la derecha/izquierda para moverte y toca dos veces para activar.',
    errors: '• Envía con los campos vacíos para escuchar los errores.',
  },
};

export default accessibility;
