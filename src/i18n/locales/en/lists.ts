/** English texts: lists. Keys are used with useTranslation('lists'). */
const lists = {
  items_one: '{{formatted}} item',
  items_other: '{{formatted}} items',
  descriptions: {
    ScrollView:
      'Renders ALL items at once. Slow mount and high memory usage with large lists.',
    FlatList:
      'Virtualizes: only mounts items near the visible area and unmounts the rest.',
    FlashList:
      'Recycles views that leave the screen to render new ones. Fewer mounts, smoother scrolling.',
  },
  stats: {
    mountTime: 'Mount time',
    jsFps: 'JS FPS',
    mountedRows: 'Mounted rows',
  },
};

export default lists;
