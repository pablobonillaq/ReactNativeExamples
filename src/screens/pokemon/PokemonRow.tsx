import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { makeStyles } from '../../theme';
import type { Pokemon } from './pokeApi';

function PokemonRowComponent({ pokemon }: { pokemon: Pokemon }) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Image source={{ uri: pokemon.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.number}>
          #{String(pokemon.id).padStart(4, '0')}
        </Text>
        <Text style={styles.name}>{pokemon.name}</Text>
      </View>
    </View>
  );
}

export const PokemonRow = memo(PokemonRowComponent);

const useStyles = makeStyles(c => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: c.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  image: {
    width: 72,
    height: 72,
    marginRight: 16,
    borderRadius: 36,
    backgroundColor: c.background,
  },
  info: {
    flex: 1,
  },
  number: {
    fontSize: 13,
    fontWeight: '600',
    color: c.placeholder,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: c.text,
    textTransform: 'capitalize',
  },
}));
