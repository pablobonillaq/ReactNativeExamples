import { Text } from 'react-native';
import { useFormStyles } from './formStyles';

/**
 * Hides a decorative or duplicated element from VoiceOver (iOS) and
 * TalkBack (Android). Each platform uses its own prop.
 */
export const hiddenFromScreenReaders = {
  accessibilityElementsHidden: true, // iOS
  importantForAccessibility: 'no-hide-descendants', // Android
} as const;

/**
 * Field error that screen readers announce as soon as it appears:
 * role "alert" on iOS, a polite live region on Android.
 */
export function ErrorText({ message }: { message: string }) {
  const formStyles = useFormStyles();
  return (
    <Text
      style={formStyles.errorText}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {message}
    </Text>
  );
}
