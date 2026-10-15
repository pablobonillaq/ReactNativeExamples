import type { Translation } from '../../types';
import type en from '../en/todo';

/** Spanish texts: todo. Same keys as ../en/todo.ts. */
const todo: Translation<typeof en> = {
  captions: {
    context: 'TodoProvider (Context) envuelve todo lo de abajo',
    redux: 'Redux <Provider store> (en App.tsx) envuelve todo lo de abajo',
    zustand: 'Sin Provider: el store de Zustand es un hook (useTodoStore)',
    mobx: 'Sin Provider: componentes observer leen el store de MobX',
    storage:
      'Guardado con AsyncStorage (el localStorage de RN): sobrevive al cerrar la app',
    sqlite:
      'Guardado en una tabla SQLite (op-sqlite): sobrevive al cerrar la app',
    native:
      'Turbo Native Module: Kotlin / Objective-C++ guardan las tareas en {{storage}}',
  },
  form: {
    task: 'Tarea',
    placeholder: '¿Qué hay que hacer?',
    date: 'Fecha',
    completed: 'Completada',
    add: 'Agregar',
  },
  list: {
    empty: 'Aún no hay tareas. Agrega una arriba.',
    summary: '{{done}} de {{total}} completadas',
    date: 'Fecha',
    cancel: 'Cancelar',
    save: 'Guardar',
  },
  generations: {
    label: 'Generation{{level}} · {{note}}',
    noProps: 'sin props',
    notes: {
      context: 'lee las tareas con useTodos()',
      redux: 'lee las tareas con useSelector()',
      zustand: 'lee las tareas con useTodoStore()',
      mobx: 'componentes observer leen el store de MobX',
      storage: 'lee las tareas con useStorageTodos()',
      sqlite: 'lee las tareas con useSqliteTodos()',
    },
  },
  native: {
    info: {
      title: 'Cómo funciona',
      flow: 'JS → JSI → C++ generado (Codegen) → {{file}} → {{storage}}',
      platform: 'plataforma',
      storage: 'almacenamiento',
      key: 'clave',
      saved_one: '{{count}} guardada',
      saved_other: '{{count}} guardadas',
    },
    search: {
      label: 'Buscar (search() nativo)',
      placeholder: "Escribe para buscar: 'cafe' encuentra 'Café'",
      matches: '{{shown}} de {{total}} coinciden con "{{query}}"',
      clear: 'Borrar búsqueda',
      noResults: 'Ninguna tarea coincide con "{{query}}".',
    },
    loading: 'Cargando desde el código nativo…',
    calls: {
      title: 'Llamadas nativas',
      legend: 'async = devuelve una Promise · sync = JS espera el valor',
      deleteAll: 'Borrar todo (clear() nativo)',
      meta: '{{mode}} · {{ms}} ms',
      todoCount_one: '[{{count}} tarea]',
      todoCount_other: '[{{count}} tareas]',
    },
    notAvailable: {
      title: 'No se encontró el módulo nativo',
      body: 'El JavaScript está cargado, pero la app instalada en el dispositivo se compiló antes de que existiera el código nativo. Recargar Metro no basta: el código nativo necesita una nueva compilación.',
    },
  },
};

export default todo;
