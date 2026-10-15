/** English texts: rerenders. Keys are used with useTranslation('rerenders'). */
const rerenders = {
  sections: {
    why: 'Why do components re-render?',
    memoSubtitle: "Skip a child's render when its props didn't change.",
    useCallbackSubtitle: 'Keep the same function between renders.',
    useMemoSubtitle: 'Keep a calculated value or object between renders.',
    useRefSubtitle: 'Remember a value without rendering.',
    whenToUse: 'When to use each one',
  },
  intro: {
    title: 'A render is React calling your component again',
    description:
      "A component renders again when its state changes, when its parent renders, or when a context it reads changes. Usually that's cheap; it becomes a problem with big trees, long lists or slow calculations.",
    steps: {
      badges:
        'Each box below shows how many times it has rendered and flashes yellow on every render.',
      columns:
        'Left column: the naive code. Right column: the same code with the optimization.',
      devTools:
        'To see it in any screen: DevTools (`j` in Metro) → ⚛️ Profiler → ⚙️ → "Highlight updates when components render".',
    },
  },
  rules: {
    reactMemo:
      'Children that render often with the same props, or are expensive (list rows, charts).',
    useCallback:
      'Functions passed to memo children or used as effect dependencies.',
    useMemo:
      'Expensive calculations, and objects / arrays passed to memo children or effects.',
    useRef:
      "Values that must survive renders but aren't shown: ids, timers, previous values, native views.",
    noneTool: 'None of them',
    none: 'Cheap components. Memoizing has a cost too (comparing props, keeping old values): measure first.',
  },
  compilerNote:
    "React Compiler (React 19) can add this memoization automatically at build time. This project doesn't enable it, so the examples behave as plain React.",

  // renderTracking.tsx
  render_one: 'render',
  render_other: 'renders',
  without: 'Without',

  labels: {
    child: 'Child ({{name}})',
    parentTick: 'Parent (tick {{tick}})',
    parentLikes: 'Parent · {{likes}} likes',
    parent: 'Parent',
    parentDark: 'Parent (dark)',
    tapCounter: 'Tap counter',
    form: 'Form',
  },
  memo: {
    description:
      "When a parent renders, all its children render too, even if their props didn't change. memo makes a child skip that render when its props are the same as last time.",
    withLabel: 'With React.memo',
    rerenderParent: 'Re-render parent',
    changeProp: "Change child's prop",
    note: 'memo compares props with Object.is (shallow). It only helps if the props really stay equal: functions, objects and arrays created during render are new every time (see the next two cards).',
  },
  callback: {
    like: '👍 Like',
    description:
      'Both children are wrapped in memo. On the left the parent creates a new onLike function on each render, so memo is useless. useCallback keeps the same function.',
    withLabel: 'With useCallback',
    rerenderParents: 'Re-render parents ({{tick}})',
    note: "Tapping Like also re-renders the parent (likes changed): on the left the button renders again with it, on the right it doesn't. useCallback without memo on the child doesn't save anything.",
  },
  calculation: {
    title: 'useMemo: expensive calculations',
    description:
      'Filtering and sorting 40,000 names takes a while. Toggling the theme re-renders both parents, but only the left one repeats the calculation.',
    withLabel: 'With useMemo',
    info: '{{matches}} matches\ncalculated {{runs}}×, last {{ms}} ms',
    toggleTheme: 'Toggle theme (unrelated state)',
    note: "Changing the filter recalculates on both sides: that's expected, the input changed.",
  },
  objects: {
    title: 'useMemo: stable objects and arrays',
    description:
      "{ … } and [ … ] written in render are new objects every time. A memo child receiving them always re-renders. useMemo keeps the same object while its inputs don't change.",
    withLabel: 'With useMemo',
    rerenderParents: 'Re-render parents',
    changeColor: 'Change color',
    note: 'The same happens with {{style}} and {{data}} passed to memo components or lists: move constants out of the component or memoize them.',
  },
  refCounter: {
    title: "useRef: values that aren't shown",
    description:
      'The number of taps is only sent to the logs. In state, every tap re-renders the component; in a ref, nothing renders until you ask to show it.',
    withLabel: 'With useRef',
    tap: 'Tap',
    showCount: 'Show count',
    count: 'Count: {{shown}} (refresh)',
    note: 'Other good uses of refs: timer and subscription ids, the previous value of a prop, flags like "is loading", and references to native views.',
  },
  refInput: {
    title: 'useRef: uncontrolled inputs',
    description:
      'A controlled input (value + state) re-renders on every key press. If you only need the text when submitting, keep it in a ref.',
    withLabel: 'With useRef',
    placeholder: 'Type here',
    send: 'Send',
    sent: 'Send → "{{sent}}"',
    note: 'Use state when the UI depends on the text while typing (validation, live search, character counter).',
  },
};

export default rerenders;
