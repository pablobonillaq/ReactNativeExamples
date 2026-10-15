import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { useJsFps } from '../../hooks/useJsFps';
import { currentLocale } from '../../i18n';
import { makeStyles, useTheme } from '../../theme';
import { generatePeople, type Person } from './data';
import { mountedRows } from './mountedRows';
import { PersonRow, ROW_HEIGHT } from './PersonRow';

type ListType = 'ScrollView' | 'FlatList' | 'FlashList';

const LIST_TYPES: ListType[] = ['ScrollView', 'FlatList', 'FlashList'];
const COUNTS = [1000, 5000, 10000];

// Descriptions of each list type live in the 'lists' namespace
// (descriptions.<ListType>).

export function ListsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation('lists');
  const [listType, setListType] = useState<ListType>('FlatList');
  const [count, setCount] = useState(1000);
  const [mountTime, setMountTime] = useState<number | null>(null);
  const [mounted, setMounted] = useState(0);
  const renderStart = useRef(Date.now());
  const fps = useJsFps();

  const data = useMemo(() => generatePeople(count), [count]);

  // Poll the mounted rows counter (see mountedRows.ts)
  useEffect(() => {
    const id = setInterval(() => setMounted(mountedRows.get()), 250);
    return () => clearInterval(id);
  }, []);

  const select = (type: ListType, newCount: number) => {
    if (type === listType && newCount === count) {
      return;
    }
    setMountTime(null);
    renderStart.current = Date.now();
    setListType(type);
    setCount(newCount);
  };

  // The container's onLayout fires once the list has mounted;
  // wait for the next frame so the first paint is included.
  const onListLayout = useCallback(() => {
    requestAnimationFrame(() => {
      setMountTime(Math.round(Date.now() - renderStart.current));
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Segmented
          options={LIST_TYPES}
          value={listType}
          onChange={type => select(type, count)}
        />
        <Segmented
          options={COUNTS}
          value={count}
          format={n =>
            t('items', {
              count: n,
              formatted: n.toLocaleString(currentLocale()),
            })
          }
          onChange={n => select(listType, n)}
        />
        <Text style={styles.description}>{t(`descriptions.${listType}`)}</Text>
        <View style={styles.stats}>
          <Stat
            label={t('stats.mountTime')}
            value={mountTime === null ? '…' : `${mountTime} ms`}
          />
          <Stat
            label={t('stats.jsFps')}
            value={String(fps)}
            color={
              fps >= 50
                ? colors.success
                : fps >= 30
                  ? colors.warning
                  : colors.danger
            }
          />
          <Stat
            label={t('stats.mountedRows')}
            value={mounted.toLocaleString(currentLocale())}
          />
        </View>
      </View>

      <View
        key={`${listType}-${count}`}
        style={styles.listContainer}
        onLayout={onListLayout}
      >
        <ListByType type={listType} data={data} />
      </View>
    </View>
  );
}

const renderItem: ListRenderItem<Person> = ({ item, index }) => (
  <PersonRow person={item} index={index} />
);

const keyExtractor = (item: Person) => item.id;

function ListByType({ type, data }: { type: ListType; data: Person[] }) {
  switch (type) {
    case 'ScrollView':
      return (
        <ScrollView>
          {data.map((person, index) => (
            <PersonRow key={person.id} person={person} index={index} />
          ))}
        </ScrollView>
      );
    case 'FlatList':
      return (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={(_, index) => ({
            length: ROW_HEIGHT,
            offset: ROW_HEIGHT * index,
            index,
          })}
        />
      );
    case 'FlashList':
      return (
        <FlashList
          data={data}
          renderItem={({ item, index }) => (
            <PersonRow person={item} index={index} />
          )}
          keyExtractor={keyExtractor}
        />
      );
  }
}

type SegmentedProps<T extends string | number> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
};

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  format = String,
}: SegmentedProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.segmented}>
      {options.map(option => {
        const selected = option === value;
        return (
          <Pressable
            key={String(option)}
            onPress={() => onChange(option)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text
              style={[
                styles.segmentText,
                selected && styles.segmentTextSelected,
              ]}
            >
              {format(option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: color ?? colors.text }]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles(c => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  controls: {
    padding: 12,
    gap: 10,
    backgroundColor: c.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.borderStrong,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: c.surfaceMuted,
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentSelected: {
    backgroundColor: c.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textSecondary,
  },
  segmentTextSelected: {
    color: c.textOnPrimary,
  },
  description: {
    fontSize: 13,
    color: c.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: c.background,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: c.textMuted,
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
  },
}));
