import { makeStyles } from '../../theme';

/**
 * Styles shared by every form field so they all look the same. Themed: call
 * `const formStyles = useFormStyles();` inside the component. The placeholder
 * color is `useTheme().colors.placeholder`.
 */
export const useFormStyles = makeStyles(c => ({
  field: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textSecondary,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: c.text,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.borderStrong,
    borderRadius: 10,
  },
  inputError: {
    borderColor: c.danger,
  },
  placeholder: {
    fontSize: 16,
    color: c.placeholder,
  },
  value: {
    fontSize: 16,
    color: c.text,
  },
  icon: {
    fontSize: 18,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: c.danger,
  },
}));
