import { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { makeStyles } from '../../theme';
import { AVATAR_TEXT_COLOR, type Person } from './data';
import { mountedRows } from './mountedRows';

export const ROW_HEIGHT = 72;

type Props = {
  person: Person;
  index: number;
};

function PersonRowComponent({ person, index }: Props) {
  // Counts how many rows are mounted at once: ScrollView mounts them all,
  // FlatList virtualizes (mounts/unmounts) and FlashList recycles the same views.
  const styles = useStyles();

  useEffect(() => {
    mountedRows.increment();
    return () => mountedRows.decrement();
  }, []);

  const initials = person.name
    .split(' ')
    .map(part => part[0])
    .join('');

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: person.color }]}>
        <Text style={[styles.initials, { color: AVATAR_TEXT_COLOR }]}>
          {initials}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {person.name}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {person.email}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.index}>#{index + 1}</Text>
        <Text style={styles.city}>{person.city}</Text>
      </View>
    </View>
  );
}

export const PersonRow = memo(PersonRowComponent);

const useStyles = makeStyles(c => ({
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: c.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initials: {
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
  },
  email: {
    fontSize: 12,
    color: c.textMuted,
    marginTop: 2,
  },
  meta: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  index: {
    fontSize: 12,
    fontWeight: '600',
    color: c.primary,
  },
  city: {
    fontSize: 11,
    color: c.placeholder,
    marginTop: 2,
  },
}));
