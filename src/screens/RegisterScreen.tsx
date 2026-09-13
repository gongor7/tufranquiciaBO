import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';
import { colors, spacing, radii, typography } from '../theme';
import { departments, industries, getIndustry, getIndustryLabel } from '../constants';
import { SEGMENTS, SUBTYPE_LABELS } from '../constants/segments';
import { useUserStore } from '../stores/useUserStore';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { FormField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { FranchiseRepository } from '../database/repositories/franchise.repository';
import { createFranchiseBaseSchema } from '../utils/validators';
import {
  societySchema,
  projectSchema,
  mipeSchema,
} from '../utils/segmentValidators';
import { formatInvestmentRange } from '../utils/formatters';
import type { StackScreenProps } from '../navigation/types';
import type { MipeStage, Segment, SupportLevel } from '../types';

type Props = StackScreenProps<'Register'>;

interface StepState {
  segment: Segment | '';
  subtype: string;
  mipeStage: string;
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
  soughtAmount: string;
  availablePercentage: string;
  projectStart: string;
  projectEnd: string;
  pitch: string;
  videoUrl: string;
  formalizationPlan: string;
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
  segment: '',
  subtype: '',
  mipeStage: '',
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
  soughtAmount: '',
  availablePercentage: '',
  projectStart: '',
  projectEnd: '',
  pitch: '',
  videoUrl: '',
  formalizationPlan: '',
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

const franchiseSubtypeOptions = [
  { label: 'Individual', value: 'individual' },
  { label: 'Departamental', value: 'departamental' },
  { label: 'Nacional', value: 'nacional' },
];

const societySubtypeOptions = [
  { label: 'SRL — capital social', value: 'srl' },
  { label: 'SA — acciones', value: 'sa' },
];

const mipeStageOptions = [
  { label: 'En idea', value: 'idea' },
  { label: 'Validado', value: 'validado' },
  { label: 'Operativo', value: 'operativo' },
];

const SEGMENT_TITLES: Record<string, string> = {
  franquicia: 'franquicia',
  sociedad: 'sociedad',
  proyecto: 'proyecto',
  mipe: 'emprendimiento (MIPE)',
};

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
            Para registrar una oportunidad primero cambia tu rol a «franquiciador» desde tu
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

  const segment = state.segment;
  const stepCount = 4;

  const setField = (key: keyof StepState, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const draft = () => ({
    segment: state.segment || undefined,
    subtype: state.subtype || undefined,
    mipeStage: state.mipeStage || undefined,
    name: state.name,
    tagline: state.tagline || undefined,
    industry: state.industry,
    description: state.description,
    department: state.department,
    city: state.city,
    minInvestment: Number(state.minInvestment) || 0,
    maxInvestment: Number(state.maxInvestment) || 0,
    soughtAmount: state.soughtAmount === '' ? undefined : Number(state.soughtAmount),
    availablePercentage:
      state.availablePercentage === '' ? undefined : Number(state.availablePercentage),
    projectStart: state.projectStart || undefined,
    projectEnd: state.projectEnd || undefined,
    pitch: state.pitch || undefined,
    videoUrl: state.videoUrl || undefined,
    formalizationPlan: state.formalizationPlan || undefined,
    royaltyPercentage: Number(state.royaltyPercentage) || 0,
    estimatedRoi: state.estimatedRoi || undefined,
    employeesRequired: Number(state.employeesRequired) || 1,
    trainingWeeks: Number(state.trainingWeeks) || 1,
    supportLevel: state.supportLevel,
    website: state.website,
    contactName: state.contactName,
    contactEmail: state.contactEmail,
    contactPhone: state.contactPhone || undefined,
    whatsapp: state.whatsapp || undefined,
  });

  const schemaForSegment = (): z.ZodTypeAny | null => {
    if (segment === 'sociedad') return societySchema;
    if (segment === 'proyecto') return projectSchema;
    if (segment === 'mipe') return mipeSchema;
    if (segment === 'franquicia') return createFranchiseBaseSchema;
    return null;
  };

  const stepKeysForSegment = (): Record<string, true> | null => {
    if (segment == null || segment === '') return null;
    const common1 = { segment: true, subtype: true, mipeStage: true, name: true, tagline: true, industry: true, description: true } as const;
    if (step === 1) return common1;
    if (step === 2) {
      const common2 = { department: true, city: true } as const;
      if (segment === 'franquicia') {
        return { ...common2, minInvestment: true, maxInvestment: true, royaltyPercentage: true, estimatedRoi: true };
      }
      if (segment === 'sociedad') {
        return { ...common2, soughtAmount: true, availablePercentage: true };
      }
      if (segment === 'proyecto') {
        return { ...common2, soughtAmount: true, projectStart: true, projectEnd: true };
      }
      return { ...common2, soughtAmount: true };
    }
    if (step === 3) {
      if (segment === 'franquicia') {
        return { employeesRequired: true, trainingWeeks: true, supportLevel: true, website: true };
      }
      if (segment === 'mipe') {
        return { pitch: true, videoUrl: true, formalizationPlan: true, website: true };
      }
      return { website: true };
    }
    return { contactName: true, contactEmail: true, contactPhone: true, whatsapp: true };
  };

  const validateStep = (): boolean => {
    if (segment === '' || segment == null) {
      setErrors({ segment: 'Seleccioná el segmento de tu oportunidad' });
      return false;
    }

    const schema = schemaForSegment();
    const keys = stepKeysForSegment();
    if (schema == null || keys == null) return false;

    const partial = (schema as z.ZodObject<z.ZodRawShape>).pick(keys);
    const result = partial.safeParse(draft());

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
      segment === 'franquicia' &&
      step === 2 &&
      Number(state.maxInvestment) < Number(state.minInvestment)
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
    if (step < stepCount) {
      setStep(step + 1);
    }
  };

  const publish = async () => {
    if (!validateStep()) {
      return;
    }
    const dto = {
      ...draft(),
      segment: segment as Segment,
      subtype: state.subtype || undefined,
      mipeStage: (state.mipeStage || undefined) as MipeStage | undefined,
    };
    const created = await FranchiseRepository.create(dto);
    await useFranchiseStore.getState().refresh();
    Alert.alert('¡Publicación exitosa!', `«${created.name}» ya está disponible en el marketplace.`);
    navigation.goBack();
  };

  const stepTitles = [
    'Datos básicos',
    segment === '' ? 'Datos básicos' : 'Ubicación y finanzas',
    segment === 'mipe' ? 'Pitch e incubación' : 'Operaciones',
    'Contacto y publicación',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <Text style={styles.muted}>Paso {step} de {stepCount}</Text>
        <Text style={styles.stepTitle}>{stepTitles[step - 1]}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${(step / stepCount) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {step === 1 && (
          <>
            <Select
              label="¿Qué querés publicar? *"
              selectedValue={state.segment}
              options={SEGMENTS.map((s) => ({ label: `${s.emoji} ${s.label}`, value: s.id }))}
              onSelect={(value) => setField('segment', value)}
            />
            {errors.segment != null && <Text style={styles.error}>{errors.segment}</Text>}

            {segment === 'franquicia' && (
              <>
                <Select
                  label="Alcance de la franquicia *"
                  selectedValue={state.subtype}
                  options={franchiseSubtypeOptions}
                  onSelect={(value) => setField('subtype', value)}
                />
                {errors.subtype != null && <Text style={styles.error}>{errors.subtype}</Text>}
              </>
            )}
            {segment === 'sociedad' && (
              <>
                <Select
                  label="Tipo de sociedad *"
                  selectedValue={state.subtype}
                  options={societySubtypeOptions}
                  onSelect={(value) => setField('subtype', value)}
                />
                {errors.subtype != null && <Text style={styles.error}>{errors.subtype}</Text>}
              </>
            )}
            {segment === 'mipe' && (
              <>
                <Select
                  label="Etapa del emprendimiento *"
                  selectedValue={state.mipeStage}
                  options={mipeStageOptions}
                  onSelect={(value) => setField('mipeStage', value)}
                />
                {errors.mipeStage != null && <Text style={styles.error}>{errors.mipeStage}</Text>}
              </>
            )}

            <FormField
              label={`Nombre de la ${segment === '' ? 'oportunidad' : SEGMENT_TITLES[segment]} *`}
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

            {segment === 'franquicia' && (
              <>
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

            {segment === 'sociedad' && (
              <>
                <FormField
                  label="Monto de participación buscado (USD) *"
                  placeholder="Ej. 90000"
                  keyboardType="number-pad"
                  value={state.soughtAmount}
                  onChangeText={(text) => setField('soughtAmount', text)}
                  error={errors.soughtAmount}
                />
                <FormField
                  label="Porcentaje disponible (1-100) *"
                  placeholder="Ej. 25"
                  keyboardType="number-pad"
                  value={state.availablePercentage}
                  onChangeText={(text) => setField('availablePercentage', text)}
                  error={errors.availablePercentage}
                />
              </>
            )}

            {segment === 'proyecto' && (
              <>
                <FormField
                  label="Aporte requerido (USD) *"
                  placeholder="Ej. 15000"
                  keyboardType="number-pad"
                  value={state.soughtAmount}
                  onChangeText={(text) => setField('soughtAmount', text)}
                  error={errors.soughtAmount}
                />
                <FormField
                  label="Fecha de inicio *"
                  placeholder="AAAA-MM-DD"
                  value={state.projectStart}
                  onChangeText={(text) => setField('projectStart', text)}
                  error={errors.projectStart}
                />
                <FormField
                  label="Fecha de fin *"
                  placeholder="AAAA-MM-DD"
                  value={state.projectEnd}
                  onChangeText={(text) => setField('projectEnd', text)}
                  error={errors.projectEnd}
                />
              </>
            )}

            {segment === 'mipe' && (
              <FormField
                label="Monto buscado (USD, opcional — 0 si aún no lo definís)"
                placeholder="Ej. 20000"
                keyboardType="number-pad"
                value={state.soughtAmount}
                onChangeText={(text) => setField('soughtAmount', text)}
                error={errors.soughtAmount}
              />
            )}
          </>
        )}

        {step === 3 && (
          <>
            {segment === 'franquicia' && (
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
              </>
            )}

            {segment === 'mipe' && (
              <>
                <FormField
                  label="Pitch *"
                  placeholder="Vendé tu emprendimiento en pocas frases..."
                  multiline
                  numberOfLines={4}
                  style={{ minHeight: 90, textAlignVertical: 'top' }}
                  value={state.pitch}
                  onChangeText={(text) => setField('pitch', text)}
                  error={errors.pitch}
                />
                <FormField
                  label="Video del pitch (URL)"
                  placeholder="https://youtube.com/..."
                  keyboardType="url"
                  autoCapitalize="none"
                  value={state.videoUrl}
                  onChangeText={(text) => setField('videoUrl', text)}
                  error={errors.videoUrl}
                />
                <FormField
                  label="Plan de formalización *"
                  placeholder="SEPREC, NIT, SENAPI..."
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 70, textAlignVertical: 'top' }}
                  value={state.formalizationPlan}
                  onChangeText={(text) => setField('formalizationPlan', text)}
                  error={errors.formalizationPlan}
                />
              </>
            )}

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
              placeholder="contacto@negocio.bo"
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
                  <Text style={styles.previewName}>{state.name || 'Tu oportunidad'}</Text>
                  <Text style={styles.previewMeta}>
                    {segment !== '' && SEGMENTS.find((s) => s.id === segment)?.label}
                    {state.subtype !== '' ? ` · ${SUBTYPE_LABELS[state.subtype] ?? state.subtype}` : ''} ·{' '}
                    {getIndustryLabel(state.industry) || 'Categoría'} · {state.city || 'Ciudad'}
                  </Text>
                  <Text style={styles.previewInvestment}>
                    {segment === 'franquicia'
                      ? formatInvestmentRange(
                          Number(state.minInvestment) || 0,
                          Number(state.maxInvestment) || 0,
                        )
                      : state.soughtAmount !== ''
                        ? `Monto: US$ ${Number(state.soughtAmount).toLocaleString('es-BO')}`
                        : 'Monto a convenir'}
                  </Text>
                </View>
              </View>
              {state.description !== '' && (
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
        {step < stepCount ? (
          <Button title="Siguiente" onPress={next} />
        ) : (
          <Button title="Publicar" onPress={() => void publish()} />
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
