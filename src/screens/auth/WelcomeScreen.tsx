import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors, spacing, radii, typography } from '../../theme';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../stores/useUserStore';
import { registrationSchema, RegistrationFormValues } from '../../utils/validators';

export function WelcomeScreen() {
  const register = useUserStore((s) => s.register);
  const [accepted, setAccepted] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      acceptedTerms: false,
    },
  });

  const toggleTerms = () => {
    const next = !accepted;
    setAccepted(next);
    setValue('acceptedTerms', next, { shouldValidate: true });
  };

  const submit = handleSubmit(async (values) => {
    try {
      await register(values);
    } catch {
      Alert.alert('Error', 'No pudimos completar tu registro. Intentá nuevamente.');
    }
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🏢</Text>
        <Text style={styles.heroTitle}>Bienvenido a TuFranquiciaBO</Text>
        <Text style={styles.heroSubtitle}>
          La plataforma que conecta inversionistas con oportunidades en Bolivia.
          Registrate para explorar franquicias, sociedades, proyectos y emprendimientos.
        </Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>👤 Modo Inversionista</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Creá tu cuenta</Text>
      <Text style={styles.sectionHint}>
        Tus datos se guardan en tu dispositivo; los usamos para agilizar tus solicitudes.
      </Text>

      <Controller
        control={control}
        name="fullName"
        render={({ field }) => (
          <FormField
            label="Nombre completo *"
            placeholder="Ej. María Fernanda Rojas"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.fullName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="username"
        render={({ field }) => (
          <FormField
            label="Nombre de usuario *"
            placeholder="Ej. ferojas"
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.username?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <FormField
            label="Correo electrónico *"
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <FormField
            label="Celular *"
            placeholder="+591 ..."
            keyboardType="phone-pad"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.phone?.message}
          />
        )}
      />

      <Pressable style={styles.termsRow} onPress={toggleTerms}>
        <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
          {accepted && <Text style={styles.checkboxMark}>✓</Text>}
        </View>
        <Text style={styles.termsText}>
          Acepto los <Text style={styles.termsLink}>Términos y Condiciones</Text> y la política
          de privacidad de la plataforma.
        </Text>
      </Pressable>
      {errors.acceptedTerms != null && (
        <Text style={styles.error}>{errors.acceptedTerms.message}</Text>
      )}

      <Button
        title={isSubmitting ? 'Registrando...' : 'Crear cuenta y explorar'}
        disabled={isSubmitting}
        onPress={() => void submit()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  heroEmoji: {
    fontSize: 64,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.primaryDark,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  roleBadge: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(157,80,101,0.18)',
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  roleBadgeText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxMark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
  },
  termsLink: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
