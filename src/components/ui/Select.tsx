import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  selectedValue?: string;
  options: Option[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function Select({ label, selectedValue, options, onSelect, placeholder = 'Seleccionar' }: SelectProps) {
  const selected = options.find((o) => o.value === selectedValue);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const active = option.value === selectedValue;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {selected == null && <Text style={styles.placeholder}>{placeholder}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  placeholder: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});