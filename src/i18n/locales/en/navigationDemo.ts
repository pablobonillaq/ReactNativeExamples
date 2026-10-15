/** English texts: navigationDemo. Keys are used with useTranslation('navigationDemo'). */
const navigationDemo = {
  exit: 'Exit',
  menu: {
    drawer: 'Drawer',
    tabs: 'Tabs',
    stack: 'Stack',
  },
  drawer: {
    title: 'Drawer navigation',
    description:
      'A side menu that slides in from the left. Open it with the ☰ button or by swiping from the left edge.',
    button: 'Open detail from the drawer',
    source: 'Drawer navigation',
    detailTitle: 'Hello from the drawer',
  },
  tabs: {
    source: 'Tab navigation',
    one: {
      tabTitle: 'Tab 1',
      title: 'Tab navigation · Tab 1',
      description:
        'Bottom tabs keep each screen mounted and let you switch between them with the bar at the bottom.',
      button: 'Open detail from tab 1',
      detailTitle: 'Hello from the first tab',
    },
    two: {
      tabTitle: 'Tab 2',
      title: 'Tab navigation · Tab 2',
      description:
        'Same destination, different params: the detail shows another title and image.',
      button: 'Open detail from tab 2',
      detailTitle: 'Hello from the second tab',
    },
  },
  stack: {
    title: 'Stack navigation',
    description:
      'Screens are pushed on top of each other. This stack lives inside the drawer, so the detail opens here with its own back button.',
    button: 'Push detail on this stack',
    source: 'Stack navigation',
    detailTitle: 'Hello from the stack',
  },
  detail: {
    headerTitle: 'Header modified from {{source}}',
    openedFrom: 'Opened from: {{source}}',
    paramsLabel: 'Navigation params',
  },
};

export default navigationDemo;
