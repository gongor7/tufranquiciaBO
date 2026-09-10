import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors, spacing, radii, typography } from '../theme';
import { getIndustryLabel } from '../constants';
import { FranchiseRepository } from '../database/repositories/franchise.repository';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { useMessageStore } from '../stores/useMessageStore';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { formatInvestmentRange, formatRoyalty } from '../utils/formatters';
import { contactMessageSchema, ContactMessageFormValues } from '../utils/validators';
import type { StackScreenProps } from '../navigation/types';
import type { Franchise } from '../types';

type Props = StackScreenProps<'FranchiseDetail'>;

export function FranchiseDetailScreen({ route, navigation }: Props) {
  const { franchiseId } = route.params;
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const favorites = useFranchiseStore((s) => s.favorites);
  const toggleFavorite = useFranchiseStore((s) => s.toggleFavorite);
  const incrementViews = useFranchiseStore((s) => s.incrementViews);
  const sendContactMessage = useMessageStore((s) => s.sendContactMessage);
  const loadConversations = useMessageStore((s) => s.loadConversations);

  useEffect(() => {
    void load();
    void incrementViews(franchiseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [franchiseId]);

  const load = useCallback(async () => {
    const data = await FranchiseRepository.findById(franchiseId);
    setFranchise(data);
  }, [franchiseId]);

  useEffect(() => {
    void load();
  }, [load, favorites.length]);

  if (franchise == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Cargando franquicia...</Text>
      </View>
    );
  }

  const isFavorite = favorites.includes(franchise.id);

  const onFavorite = () => {
    void toggleFavorite(franchise.id);
  };

  const onSent = (message: string) => {
    setContactOpen(false);
    setSent(true);
    void loadConversations();
    Alert.alert('Consulta enviada', message);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logo}>{franchise.logoEmoji}</Text>
          </View>
          {franchise.featured && <Text style={styles.featuredTag}>Destacada</Text>}
        </View>

        <Text style={styles.name}>{franchise.name}</Text>
        {franchise.tagline != null && <Text style={styles.tagline}>{franchise.tagline}</Text>}

        <Pressable style={styles.favoriteRow} onPress={onFavorite}>
          <Text style={[styles.heart, isFavorite && styles.heartActive]}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.favoriteLabel}>
            {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
          </Text>
        </Pressable>

        <Text style={styles.investment}>
          {formatInvestmentRange(franchise.minInvestment, franchise.maxInvestment, franchise.currency)}
        </Text>

        <View style={styles.stats}>
          <Stat label="ROI estimado" value={franchise.estimatedRoi ?? '—'} />
          <Stat
            label="Royalty"
            value={formatRoyalty(franchise.royaltyPercentage, franchise.royaltyType)}
          />
          <Stat label="Empleados" value={`${franchise.employeesRequired}`} />
          <Stat label="Entrenamiento" value={`${franchise.trainingWeeks} semanas`} />
        </View>

        <DetailRow label="Categoría" value={getIndustryLabel(franchise.industry)} />
        <DetailRow label="Ubicación" value={`${franchise.department}, ${franchise.city}`} />
        <DetailRow label="Soporte" value={capitalize(franchise.supportLevel)} />

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{franchise.description}</Text>

        <Text style={styles.sectionTitle}>Contacto</Text>
        <View style={styles.contactCard}>
          <DetailRow label="Contacto" value={franchise.contactName} />
          <DetailRow label="Email" value={franchise.contactEmail} />
          {franchise.contactPhone != null && (
            <DetailRow label="Teléfono" value={franchise.contactPhone} />
          )}
          {franchise.website != null && <DetailRow label="Web" value={franchise.website} />}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`💬 Conversación`}
          variant="outline"
          onPress={() => navigation.navigate('Chat', { franchiseId: franchise.id })}
        />
        <Button
          title="Contactar"
          onPress={() => setContactOpen(true)}
        />
      </View>

      <ContactModal
        visible={contactOpen}
        franchiseName={franchise.name}
        onClose={() => {
          setContactOpen(false);
          setSent(false);
        }}
        onSubmit={async (values) => {
          await sendContactMessage({ ...values, franchiseId: franchise.id });
          onSent('El franquiciador te responderá en la conversación.');
        }}
        sent={sent}
        setSent={setSent}
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface ContactModalProps {
  visible: boolean;
  franchiseName: string;
  sent: boolean;
  onClose: () => void;
  onSubmit: (values: ContactMessageFormValues) => Promise<void>;
  setSent: (value: boolean) => void;
}

function ContactModal({ visible, franchiseName, sent, onClose, onSubmit, setSent }: ContactModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageFormValues>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      senderName: '',
      senderEmail: '',
      senderPhone: '',
      message: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    reset();
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Contactar a {franchiseName}</Text>
          <Text style={styles.modalSubtitle}>
            Completa el formulario y el franquiciador te responderá en la conversación.
          </Text>

          {sent ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <Text style={{ fontSize: 48 }}>✅</Text>
              <Text style={styles.modalSubtitle}>Consulta enviada con éxito.</Text>
            </View>
          ) : (
            <>
              <Controller
                control={control}
                name="senderName"
                render={({ field }) => (
                  <FormField
                    label="Nombre *"
                    placeholder="Tu nombre"
                    error={errors.senderName?.message}
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="senderEmail"
                render={({ field }) => (
                  <FormField
                    label="Email *"
                    placeholder="tucorreo@ejemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.senderEmail?.message}
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="senderPhone"
                render={({ field }) => (
                  <FormField
                    label="Teléfono"
                    placeholder="Opcional"
                    keyboardType="phone-pad"
                    error={errors.senderPhone?.message}
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="message"
                render={({ field }) => (
                  <FormField
                    label="Mensaje *"
                    placeholder="Hola, me interesa esta franquicia..."
                    multiline
                    numberOfLines={4}
                    style={{ minHeight: 90, textAlignVertical: 'top' }}
                    error={errors.message?.message}
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />

              <View style={styles.modalButtons}>
                <Button
                  title="Cancelar"
                  variant="ghost"
                  disabled={isSubmitting}
                  onPress={() => {
                    setSent(false);
                    onClose();
                    reset();
                  }}
                  style={{ width: undefined }}
                />
                <Button
                  title={isSubmitting ? 'Enviando...' : 'Enviar'}
                  disabled={isSubmitting}
                  onPress={() => void submit()}
                  style={{ width: undefined }}
                />
              </View>
            </>
          )}

          {sent && (
            <Button
              title="Cerrar"
              onPress={() => {
                setSent(false);
                onClose();
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  muted: {
    color: colors.textSecondary,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 40,
  },
  featuredTag: {
    marginLeft: spacing.md,
    backgroundColor: colors.accent,
    color: colors.white,
    fontWeight: '800',
    fontSize: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  tagline: {
    fontSize: 15,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginTop: 2,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  heart: {
    fontSize: 24,
  },
  heartActive: {},
  favoriteLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  investment: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  stat: {
    flexBasis: '45%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  contactCard: {
    paddingVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});