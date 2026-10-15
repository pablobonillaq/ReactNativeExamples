import type { Translation } from '../../types';
import type en from '../en/vault';

/** Spanish texts: vault. Same keys as ../en/vault.ts. */
const vault: Translation<typeof en> = {
  storageError: 'Error del almacenamiento seguro',
  header: {
    lock: '🔒 Bloquear',
    lockA11y: 'Bloquear la bóveda',
  },
  reset: {
    title: '¿Restablecer la bóveda?',
    message:
      'Esto borra todas las contraseñas guardadas y la configuración del PIN / biometría.',
    cancel: 'Cancelar',
    confirm: 'Borrar todo',
    button: 'Restablecer la bóveda',
    hint: 'Borra todas las contraseñas guardadas y la configuración del bloqueo',
  },
  footer: {
    protectedWith: 'Protegida con {{method}}',
    pin: 'PIN de 6 dígitos',
  },
  method: {
    pin: 'PIN',
  },
  biometry: {
    faceId: 'Face ID',
    touchId: 'Touch ID',
    fingerprint: 'Huella digital',
    face: 'Desbloqueo facial',
    iris: 'Iris',
    generic: 'Biometría',
  },
  biometricPrompt: {
    cancel: 'Cancelar',
  },
  setup: {
    biometricPrompt: 'Confirma con {{method}} para proteger tus contraseñas',
    notConfirmedTitle: 'No se confirmó {{method}}',
    notConfirmedMessage: 'Inténtalo de nuevo o usa un PIN de 6 dígitos.',
    biometricError: 'No se pudo configurar la biometría',
    choosePin: 'Elige un PIN de 6 dígitos',
    back: 'Atrás',
    repeatPin: 'Repite el PIN',
    mismatch: 'Los PIN no coinciden. Inténtalo de nuevo.',
    startOver: 'Empezar de nuevo',
    title: 'Protege tus contraseñas',
    subtitle:
      'Elige cómo vas a desbloquear esta bóveda. Lo usarás cada vez que la abras o quieras ver una contraseña guardada.',
    usePin: '🔢  Usar un PIN de 6 dígitos',
    usePinHint: 'Crea un PIN de 6 dígitos para desbloquear la bóveda',
    useBiometrics: '{{icon}}  Usar {{method}}',
    useBiometricsHint: 'Usa la biometría configurada en este dispositivo',
    noBiometrics:
      'No hay biometría disponible. Configura un bloqueo de pantalla y Face ID / una huella digital en los ajustes del dispositivo para usar esta opción.',
  },
  unlock: {
    biometricPrompt: 'Desbloquea tus contraseñas',
    title: 'Bóveda bloqueada',
    pinSubtitle: 'Ingresa tu PIN de 6 dígitos para continuar.',
    biometricSubtitle: 'Usa {{method}} para continuar.',
    biometricButton: '🫆  Desbloquear con {{method}}',
  },
  pin: {
    mismatch: 'Los PIN no coinciden',
    wrong_one: 'PIN incorrecto. Te queda {{count}} intento',
    wrong_other: 'PIN incorrecto. Te quedan {{count}} intentos',
    hint_one: 'Ingresa {{count}} dígito',
    hint_other: 'Ingresa {{count}} dígitos',
    tooManyAttempts: 'Demasiados intentos fallidos.',
    tryAgainIn: 'Vuelve a intentarlo en <countdown>{{time}}</countdown>',
  },
  content: {
    revealPrompt: 'Mostrar la contraseña de {{info}}',
    savedTitle: 'Contraseñas guardadas ({{number}})',
    empty: 'Todavía no hay nada guardado.',
    modalTitle: 'Mostrar la contraseña de “{{info}}”',
    enterPin: 'Ingresa tu PIN',
    cancel: 'Cancelar',
  },
  form: {
    title: 'Nueva contraseña',
    info: 'Info',
    infoPlaceholder: 'p. ej. Gmail, Banco, Netflix',
    user: 'Usuario',
    userPlaceholder: 'Usuario o correo',
    password: 'Contraseña',
    passwordPlaceholder: 'Contraseña',
    errors: {
      info: 'La info es obligatoria',
      user: 'El usuario es obligatorio',
      password: 'La contraseña es obligatoria',
    },
    saving: 'Guardando…',
    save: 'Guardar',
    saveHint: 'Guarda esta contraseña en el almacenamiento seguro',
    saved: 'Guardada en el almacenamiento seguro',
    saveError: 'No se pudo guardar',
  },
  entry: {
    passwordA11y: 'Contraseña {{password}}',
    passwordHidden: 'Contraseña oculta',
    hide: 'Ocultar contraseña',
    show: 'Mostrar contraseña',
    requires: 'Requiere tu {{method}}',
  },
};

export default vault;
