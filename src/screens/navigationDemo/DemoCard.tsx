import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../../theme';

type Props = {
  emoji: string;
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
};

/** Centered card used by every screen of the navigation demo. */
export function DemoCard({
  emoji,
  title,
  description,
  buttonLabel,
  onPress,
}: Props) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c, theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: c.background,
  },
  card: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
    borderRadius: 16,
    backgroundColor: c.surface,
    shadowColor: c.shadow,
    shadowOpacity: theme.isDark ? 0 : 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: theme.isDark ? 0 : 2,
    borderWidth: theme.isDark ? 1 : 0,
    borderColor: c.border,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: c.textSecondary,
  },
  button: {
    alignSelf: 'stretch',
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: c.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: c.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
}));
