/** English texts: todo. Keys are used with useTranslation('todo'). */
const todo = {
  captions: {
    context: 'TodoProvider (Context) wraps everything below',
    redux: 'Redux <Provider store> (in App.tsx) wraps everything below',
    zustand: 'No Provider: the Zustand store is a hook (useTodoStore)',
    mobx: 'No Provider: observer components read the MobX store',
    storage:
      "Saved with AsyncStorage (RN's localStorage): survives closing the app",
    sqlite: 'Saved in a SQLite table (op-sqlite): survives closing the app',
    native:
      'Turbo Native Module: Kotlin / Objective-C++ save the todos in {{storage}}',
  },
  form: {
    task: 'Task',
    placeholder: 'What needs to be done?',
    date: 'Date',
    completed: 'Completed',
    add: 'Add',
  },
  list: {
    empty: 'No tasks yet. Add one above.',
    summary: '{{done}} of {{total}} completed',
    date: 'Date',
    cancel: 'Cancel',
    save: 'Save',
  },
  generations: {
    label: 'Generation{{level}} · {{note}}',
    noProps: 'no props',
    notes: {
      context: 'reads the todos with useTodos()',
      redux: 'reads the todos with useSelector()',
      zustand: 'reads the todos with useTodoStore()',
      mobx: 'observer components read the MobX store',
      storage: 'reads the todos with useStorageTodos()',
      sqlite: 'reads the todos with useSqliteTodos()',
    },
  },
  native: {
    info: {
      title: 'How it works',
      flow: 'JS → JSI → generated C++ (Codegen) → {{file}} → {{storage}}',
      platform: 'platform',
      storage: 'storage',
      key: 'key',
      saved_one: '{{count}} saved',
      saved_other: '{{count}} saved',
    },
    search: {
      label: 'Search (native search())',
      placeholder: "Type to search: 'cafe' finds 'Café'",
      matches: '{{shown}} of {{total}} match "{{query}}"',
      clear: 'Clear search',
      noResults: 'No todos match "{{query}}".',
    },
    loading: 'Loading from native…',
    calls: {
      title: 'Native calls',
      legend: 'async = returns a Promise · sync = JS waits for the value',
      deleteAll: 'Delete all (native clear())',
      meta: '{{mode}} · {{ms}} ms',
      todoCount_one: '[{{count}} todo]',
      todoCount_other: '[{{count}} todos]',
    },
    notAvailable: {
      title: 'Native module not found',
      body: "The JavaScript is loaded, but the app installed on the device was built before the native code existed. Reloading Metro isn't enough: native code needs a new build.",
    },
  },
};

export default todo;
