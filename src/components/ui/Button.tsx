import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: object;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = true,
  size = 'md',
  style,
}: ButtonProps) {
  const containerStyles = [
    styles.base,
    styles[variant],
    size === 'sm' && styles.sm,
    size === 'lg' && styles.lg,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];
  const textColor =
    variant === 'primary' || variant === 'accent'
      ? colors.white
      : variant === 'outline'
        ? colors.primary
        : colors.text;
  const textStyles = [
    styles.text,
    size === 'sm' && styles.textSm,
    size === 'lg' && styles.textLg,
    { color: textColor },
  ];

  return (
    <Pressable
      style={({ pressed }) => [containerStyles, pressed && !disabled && styles.pressed]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={textStyles}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  lg: {
    paddingVertical: spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    ...typography.button,
  },
  textSm: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 18,
  },
});