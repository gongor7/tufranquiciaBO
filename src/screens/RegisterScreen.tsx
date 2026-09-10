import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing, radii, typography } from '../theme';
import { departments, industries, getIndustry, getIndustryLabel } from '../constants';
import { useUserStore } from '../stores/useUserStore';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { FormField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { FranchiseRepository } from '../database/repositories/franchise.repository';
import { createFranchiseBaseSchema, CreateFranchiseFormValues } from '../utils/validators';
import { formatInvestmentRange } from '../utils/formatters';
import type { StackScreenProps } from '../navigation/types';
import type { SupportLevel } from '../types';

type Props = StackScreenProps<'Register'>;

interface StepState {
  name: string;
  tagline: string;
  industry: string;
  description: string;
  department: string;
  city: string;
  minInvestment: string;
  maxInvestment: string;
  royaltyPercentage: string;
  estimatedRoi: string;
  employeesRequired: string;
  trainingWeeks: string;
  supportLevel: SupportLevel;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
}

const initialStep: StepState = {
  name: '',
  tagline: '',
  industry: '',
  description: '',
  department: '',
  city: '',
  minInvestment: '',
  maxInvestment: '',
  royaltyPercentage: '',
  estimatedRoi: '',
  employeesRequired: '',
  trainingWeeks: '',
  supportLevel: 'basico',
  website: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  whatsapp: '',
};

const supportOptions = [
  { label: 'Básico', value: 'basico' },
  { label: 'Avanzado', value: 'avanzado' },
  { label: 'Premium', value: 'premium' },
];

export function RegisterScreen({ navigation }: Props) {
  const [state, setState] = useState<StepState>(initialStep);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isFranquiciadorGetter = useUserStore((s) => s.isFranquiciador);
  const loadUser = useUserStore((s) => s.loadProfile);

  const [roleChecked, setRoleChecked] = useState(false);
  const [isFranquiciador, setIsFranquiciador] = useState(false);

  if (!roleChecked) {
    void (async () => {
      const value = await isFranquiciadorGetter();
      setRoleChecked(true);
      setIsFranquiciador(value);
    })();
  }

  if (!roleChecked) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Verificando tu rol...</Text>
      </View>
    );
  }

  if (!isFranquiciador) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={{ fontSize: 56, textAlign: 'center' }}>👤</Text>
          <Text style={styles.title}>Se requiere rol de franquiciador</Text>
          <Text style={styles.notice}>
            Para registrar una franquicia primero cambia tu rol a «franquiciador» desde tu
            perfil.
          </Text>
          <Button
            title="Ir a mi perfil"
            onPress={() => {
              navigation.navigate('MainTabs', { screen: 'Profile' });
              void loadUser();
            }}
          />
        </View>
      </View>
    );
  }

  const setField = (key: keyof StepState, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateStep = (): boolean => {
    const draft: CreateFranchiseFormValues = {
      name: state.name,
      tagline: state.tagline || undefined,
      industry: state.industry,
      description: state.description,
      department: state.department,
      city: state.city,
      minInvestment: Number(state.minInvestment),
      maxInvestment: Number(state.maxInvestment),
      royaltyPercentage: Number(state.royaltyPercentage),
      estimatedRoi: state.estimatedRoi || undefined,
      employeesRequired: Number(state.employeesRequired),
      trainingWeeks: Number(state.trainingWeeks),
      supportLevel: state.supportLevel,
      website: state.website,
      contactName: state.contactName,
      contactEmail: state.contactEmail,
      contactPhone: state.contactPhone || undefined,
      whatsapp: state.whatsapp || undefined,
    };

    const stepKeys =
      step === 1
        ? ({ name: true, tagline: true, industry: true, description: true } as const)
        : step === 2
          ? ({
              department: true,
              city: true,
              minInvestment: true,
              maxInvestment: true,
              royaltyPercentage: true,
              estimatedRoi: true,
            } as const)
          : step === 3
            ? ({
                employeesRequired: true,
                trainingWeeks: true,
                supportLevel: true,
                website: true,
              } as const)
            : ({ contactName: true, contactEmail: true, contactPhone: true, whatsapp: true } as const);
    const partial = createFranchiseBaseSchema.pick(stepKeys);
    const result = partial.safeParse(draft);

    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (nextErrors[key] == null) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return false;
    }

    if (
      step === 2 &&
      result.data.minInvestment != null &&
      result.data.maxInvestment != null &&
      Number(result.data.maxInvestment) < Number(result.data.minInvestment)
    ) {
      setErrors({ maxInvestment: 'La inversión máxima no puede ser menor que la mínima' });
      return false;
    }

    setErrors({});
    return true;
  };

  const next = () => {
    if (!validateStep()) {
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const publish = async () => {
    if (!validateStep()) {
      return;
    }
    const dto = {
      name: state.name,
      tagline: state.tagline || undefined,
      industry: state.industry,
      description: state.description,
      department: state.department,
      city: state.city,
      minInvestment: Number(state.minInvestment),
      maxInvestment: Number(state.maxInvestment),
      royaltyPercentage: Number(state.royaltyPercentage),
      estimatedRoi: state.estimatedRoi || undefined,
      employeesRequired: Number(state.employeesRequired),
      trainingWeeks: Number(state.trainingWeeks),
      supportLevel: state.supportLevel,
      website: state.website || undefined,
      contactName: state.contactName,
      contactEmail: state.contactEmail,
      contactPhone: state.contactPhone || undefined,
      whatsapp: state.whatsapp || undefined,
    };
    const created = await FranchiseRepository.create(dto);
    await useFranchiseStore.getState().refresh();
    Alert.alert('¡Franquicia publicada!', `«${created.name}» ya está disponible en el marketplace.`);
    navigation.goBack();
  };

  const stepTitles = ['Datos básicos', 'Datos financieros', 'Operaciones', 'Contacto y publicación'];

  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <Text style={styles.muted}>Paso {step} de 4</Text>
        <Text style={styles.stepTitle}>{stepTitles[step - 1]}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${step * 25}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {step === 1 && (
          <>
            <FormField
              label="Nombre de la franquicia *"
              placeholder="Ej. Café Amazonas"
              value={state.name}
              onChangeText={(text) => setField('name', text)}
              error={errors.name}
            />
            <FormField
              label="Eslogan"
              placeholder="Una frase corta"
              value={state.tagline}
              onChangeText={(text) => setField('tagline', text)}
              error={errors.tagline}
            />
            <Select
              label="Categoría *"
              selectedValue={state.industry}
              options={industries.map((i) => ({ label: `${i.emoji} ${i.label}`, value: i.id }))}
              onSelect={(value) => setField('industry', value)}
            />
            {errors.industry != null && <Text style={styles.error}>{errors.industry}</Text>}
            <FormField
              label="Descripción *"
              placeholder="Describe el modelo de negocio..."
              multiline
              numberOfLines={4}
              style={{ minHeight: 90, textAlignVertical: 'top' }}
              value={state.description}
              onChangeText={(text) => setField('description', text)}
              error={errors.description}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Select
              label="Departamento *"
              selectedValue={state.department}
              options={departments.map((d) => ({ label: d, value: d }))}
              onSelect={(value) => setField('department', value)}
            />
            {errors.department != null && <Text style={styles.error}>{errors.department}</Text>}
            <FormField
              label="Ciudad *"
              placeholder="Ej. La Paz"
              value={state.city}
              onChangeText={(text) => setField('city', text)}
              error={errors.city}
            />
            <FormField
              label="Inversión mínima (USD) *"
              placeholder="Ej. 25000"
              keyboardType="number-pad"
              value={state.minInvestment}
              onChangeText={(text) => setField('minInvestment', text)}
              error={errors.minInvestment}
            />
            <FormField
              label="Inversión máxima (USD) *"
              placeholder="Ej. 40000"
              keyboardType="number-pad"
              value={state.maxInvestment}
              onChangeText={(text) => setField('maxInvestment', text)}
              error={errors.maxInvestment}
            />
            <FormField
              label="Royalty (%) *"
              placeholder="Ej. 5"
              keyboardType="number-pad"
              value={state.royaltyPercentage}
              onChangeText={(text) => setField('royaltyPercentage', text)}
              error={errors.royaltyPercentage}
            />
            <FormField
              label="ROI estimado"
              placeholder="Ej. 20%"
              value={state.estimatedRoi}
              onChangeText={(text) => setField('estimatedRoi', text)}
              error={errors.estimatedRoi}
            />
          </>
        )}

        {step === 3 && (
          <>
            <FormField
              label="Empleados requeridos *"
              placeholder="Ej. 4"
              keyboardType="number-pad"
              value={state.employeesRequired}
              onChangeText={(text) => setField('employeesRequired', text)}
              error={errors.employeesRequired}
            />
            <FormField
              label="Semanas de entrenamiento *"
              placeholder="Ej. 3"
              keyboardType="number-pad"
              value={state.trainingWeeks}
              onChangeText={(text) => setField('trainingWeeks', text)}
              error={errors.trainingWeeks}
            />
            <Select
              label="Nivel de soporte *"
              selectedValue={state.supportLevel}
              options={supportOptions}
              onSelect={(value) => setField('supportLevel', value)}
            />
            <FormField
              label="Sitio web"
              placeholder="https://..."
              keyboardType="url"
              autoCapitalize="none"
              value={state.website}
              onChangeText={(text) => setField('website', text)}
              error={errors.website}
            />
          </>
        )}

        {step === 4 && (
          <>
            <FormField
              label="Nombre de contacto *"
              placeholder="Ej. María Espinoza"
              value={state.contactName}
              onChangeText={(text) => setField('contactName', text)}
              error={errors.contactName}
            />
            <FormField
              label="Email de contacto *"
              placeholder="contacto@franquicia.bo"
              keyboardType="email-address"
              autoCapitalize="none"
              value={state.contactEmail}
              onChangeText={(text) => setField('contactEmail', text)}
              error={errors.contactEmail}
            />
            <FormField
              label="Teléfono"
              placeholder="+591 ..."
              keyboardType="phone-pad"
              value={state.contactPhone}
              onChangeText={(text) => setField('contactPhone', text)}
              error={errors.contactPhone}
            />
            <FormField
              label="WhatsApp"
              placeholder="+591 ..."
              keyboardType="phone-pad"
              value={state.whatsapp}
              onChangeText={(text) => setField('whatsapp', text)}
              error={errors.whatsapp}
            />

            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Vista previa</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewEmoji}>{getIndustry(state.industry)?.emoji ?? '🏢'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewName}>{state.name || 'Tu franquicia'}</Text>
                  <Text style={styles.previewMeta}>
                    {getIndustryLabel(state.industry) || 'Categoría'} · {state.city || 'Ciudad'} ·{' '}
                    {state.department || 'Departamento'}
                  </Text>
                  <Text style={styles.previewInvestment}>
                    {state.minInvestment != null && state.maxInvestment != null
                      ? formatInvestmentRange(
                          Number(state.minInvestment) || 0,
                          Number(state.maxInvestment) || 0,
                        )
                      : 'Rango de inversión'}
                  </Text>
                </View>
              </View>
              {state.description != null && (
                <Text style={styles.previewDesc} numberOfLines={3}>
                  {state.description}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.navButtons}>
        {step > 1 && (
          <Button title="Atrás" variant="ghost" onPress={() => setStep(step - 1)} />
        )}
        {step < 4 ? (
          <Button title="Siguiente" onPress={next} />
        ) : (
          <Button title="Publicar franquicia" onPress={() => void publish()} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  muted: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  stepHeader: {
    marginBottom: spacing.lg,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radii.full,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  notice: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  center: {
    alignItems: 'center',
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  preview: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  previewTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewEmoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  previewMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewInvestment: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  previewDesc: {
    fontSize: 14,
    color: colors.text,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});