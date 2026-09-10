import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
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
import { getFranchiseImage } from '../constants/images';
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

  const onWhatsapp = () => {
    if (franchise.whatsapp == null) return;
    const digits = franchise.whatsapp.replace(/\D/g, '');
    void Linking.openURL(
      `https://wa.me/${digits}?text=${encodeURIComponent(
        `Hola, me interesa la franquicia de ${franchise.name} que vi en TuFranquiciaBO.`,
      )}`,
    );
  };

  const onSent = (message: string) => {
    setContactOpen(false);
    setSent(true);
    void loadConversations();
    Alert.alert('Consulta enviada', message);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={{ uri: getFranchiseImage(franchise.slug) }} style={StyleSheet.absoluteFill} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroActions}>
            <Pressable style={styles.circleButton} onPress={() => navigation.goBack()}>
              <Text style={styles.circleButtonText}>←</Text>
            </Pressable>
            <Pressable style={styles.circleButton} onPress={onFavorite}>
              <Text style={styles.circleButtonText}>{isFavorite ? '❤️' : '🤍'}</Text>
            </Pressable>
          </View>
          {franchise.featured && (
            <View style={styles.heroFooter}>
              <Text style={styles.featuredTag}>★ Franquicia destacada</Text>
              <Text style={styles.heroViews}>👁 {franchise.viewsCount} consultas</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logo}>{franchise.logoEmoji}</Text>
            </View>
            <View style={styles.titleInfo}>
              <Text style={styles.name}>{franchise.name}</Text>
              {franchise.tagline != null && (
                <Text style={styles.tagline}>{franchise.tagline}</Text>
              )}
            </View>
          </View>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{franchise.industryEmoji} {getIndustryLabel(franchise.industry)}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>📍 {franchise.city}, {franchise.department}</Text>
            </View>
            <View style={[styles.chip, styles.chipSupport]}>
              <Text style={[styles.chipText, styles.chipSupportText]}>
                🛠 Soporte {capitalize(franchise.supportLevel)}
              </Text>
            </View>
          </View>

          <View style={styles.investmentBanner}>
            <Text style={styles.investmentLabel}>INVERSIÓN INICIAL ESTIMADA</Text>
            <Text style={styles.investment}>
              {formatInvestmentRange(franchise.minInvestment, franchise.maxInvestment, franchise.currency)}
            </Text>
          </View>

          <View style={styles.stats}>
            <Stat icon="📈" label="ROI estimado" value={franchise.estimatedRoi ?? '—'} />
            <Stat
              icon="💳"
              label="Royalty"
              value={formatRoyalty(franchise.royaltyPercentage, franchise.royaltyType)}
            />
            <Stat icon="👥" label="Empleados" value={`${franchise.employeesRequired}`} />
            <Stat icon="🎓" label="Capacitación" value={`${franchise.trainingWeeks} semanas`} />
          </View>

          <Text style={styles.sectionTitle}>Sobre la franquicia</Text>
          <Text style={styles.description}>{franchise.description}</Text>

          <Text style={styles.sectionTitle}>Contacto del franquiciador</Text>
          <View style={styles.contactCard}>
            <DetailRow icon="👤" label="Responsable" value={franchise.contactName} />
            <DetailRow icon="✉️" label="Email" value={franchise.contactEmail} />
            {franchise.contactPhone != null && (
              <DetailRow icon="📞" label="Teléfono" value={franchise.contactPhone} />
            )}
            {franchise.website != null && (
              <DetailRow icon="🌐" label="Sitio web" value={franchise.website} />
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="💬 Conversar"
          variant="outline"
          onPress={() => navigation.navigate('Chat', { franchiseId: franchise.id })}
        />
        <Button
          title="Solicitar información"
          onPress={() => setContactOpen(true)}
        />
      </View>

      {franchise.whatsapp != null && (
        <Pressable style={styles.whatsappFab} onPress={onWhatsapp}>
          <Text style={styles.whatsappFabText}>WhatsApp</Text>
        </Pressable>
      )}

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

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
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
  hero: {
    height: 230,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11,37,69,0.45)',
  },
  heroActions: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  circleButtonText: {
    fontSize: 18,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  featuredTag: {
    backgroundColor: colors.accent,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  heroViews: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  logo: {
    fontSize: 36,
  },
  titleInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chipSupport: {
    backgroundColor: 'rgba(212,168,67,0.15)',
    borderColor: colors.accent,
  },
  chipSupportText: {
    color: '#8A6D1F',
  },
  investmentBanner: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  investmentLabel: {
    color: colors.accentLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  investment: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  detailIcon: {
    fontSize: 15,
    marginRight: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
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
  whatsappFab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 90,
    backgroundColor: '#25D366',
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  whatsappFabText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 14,
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
