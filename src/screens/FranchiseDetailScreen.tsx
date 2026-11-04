import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing, radii, typography } from '../theme';
import { getIndustryLabel } from '../constants';
import { MIPE_STAGE_LABELS, SEGMENT_LABELS, SUBTYPE_LABELS } from '../constants/segments';
import { getFranchiseGallery } from '../constants/images';
import { FranchiseRepository } from '../database/repositories/franchise.repository';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { useTicketStore } from '../stores/useTicketStore';
import { Button } from '../components/ui/Button';
import { Icon, IconName } from '../components/ui/Icon';
import { getIndustryIcon } from '../constants/icons';
import { MediaCarousel } from '../components/features/MediaCarousel';
import { formatInvestmentRange, formatRoyalty } from '../utils/formatters';
import { openWhatsApp } from '../utils/links';
import type { StackScreenProps } from '../navigation/types';
import type { Franchise } from '../types';

type Props = StackScreenProps<'FranchiseDetail'>;

export function FranchiseDetailScreen({ route, navigation }: Props) {
  const { franchiseId } = route.params;
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [requesting, setRequesting] = useState(false);
  const favorites = useFranchiseStore((s) => s.favorites);
  const toggleFavorite = useFranchiseStore((s) => s.toggleFavorite);
  const incrementViews = useFranchiseStore((s) => s.incrementViews);
  const createTicket = useTicketStore((s) => s.createTicket);

  const load = useCallback(async () => {
    const data = await FranchiseRepository.findById(franchiseId);
    setFranchise(data);
  }, [franchiseId]);

  useEffect(() => {
    // Carga inicial del detalle (fetch-on-mount sobre SQLite local).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    void incrementViews(franchiseId);
  }, [load, incrementViews, franchiseId]);

  useEffect(() => {
    // Recarga cuando cambian favoritos para reflejar el corazón.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load, favorites.length]);

  if (franchise == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Cargando oportunidad...</Text>
      </View>
    );
  }

  const isFavorite = favorites.includes(franchise.id);
  const gallery = getFranchiseGallery(franchise.slug);

  const onFavorite = () => {
    void toggleFavorite(franchise.id);
  };

  const onWhatsApp = () => {
    openWhatsApp(
      franchise.whatsapp ?? franchise.contactPhone,
      `Hola, me interesa la oportunidad de ${franchise.name} que vi en la plataforma.`,
    );
  };

  const onRequestInfo = async () => {
    setRequesting(true);
    try {
      await createTicket(franchise.id);
      Alert.alert(
        'Solicitud enviada',
        `Tu solicitud sobre ${franchise.name} fue registrada. El equipo la atenderá y podrás verla en la pestaña Solicitudes.`,
      );
    } catch {
      Alert.alert('Error', 'No pudimos registrar tu solicitud. Intentá nuevamente.');
    } finally {
      setRequesting(false);
    }
  };

  const isProjectExpired =
    franchise.projectEnd != null && franchise.projectEnd < new Date().toISOString().slice(0, 10);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <MediaCarousel images={gallery} logoEmoji={franchise.logoEmoji} />
          <View style={styles.heroActions}>
            <Pressable style={styles.circleButton} onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={20} color={colors.primaryDark} />
            </Pressable>
            <Pressable style={styles.circleButton} onPress={onFavorite}>
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={19}
                color={isFavorite ? colors.primary : colors.textSecondary}
              />
            </Pressable>
          </View>
          {franchise.featured && (
            <View style={styles.heroFooter}>
              <View style={styles.featuredTagRow}>
                <Icon name="star" size={11} color={colors.primaryDark} />
                <Text style={styles.featuredTag}>Oportunidad destacada</Text>
              </View>
              <View style={styles.heroViewsRow}>
                <Icon name="eye-outline" size={13} color={colors.white} />
                <Text style={styles.heroViews}>{franchise.viewsCount} consultas</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.name}>{franchise.name}</Text>
              {franchise.tagline != null && (
                <Text style={styles.tagline}>{franchise.tagline}</Text>
              )}
            </View>
          </View>

          <View style={styles.chipRow}>
            <View style={[styles.chip, styles.chipSupport]}>
              <Text style={[styles.chipText, styles.chipSupportText]}>
                {SEGMENT_LABELS[franchise.segment]}
                {franchise.subtype != null && franchise.segment === 'franquicia'
                  ? ` · ${SUBTYPE_LABELS[franchise.subtype] ?? franchise.subtype}`
                  : ''}
              </Text>
            </View>
            <View style={styles.chip}>
              <View style={styles.chipContent}>
                <Icon name={getIndustryIcon(franchise.industry)} size={12} color={colors.textSecondary} />
                <Text style={styles.chipText}>{getIndustryLabel(franchise.industry)}</Text>
              </View>
            </View>
            <View style={styles.chip}>
              <View style={styles.chipContent}>
                <Icon name="location" size={12} color={colors.textSecondary} />
                <Text style={styles.chipText}>{franchise.city}, {franchise.department}</Text>
              </View>
            </View>
            {franchise.segment === 'mipe' && franchise.mipeStage != null && (
              <View style={styles.chip}>
                <View style={styles.chipContent}>
                  <Icon name="trending-up-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.chipText}>{MIPE_STAGE_LABELS[franchise.mipeStage]}</Text>
                </View>
              </View>
            )}
            {franchise.segment === 'proyecto' && franchise.projectEnd != null && (
              <View style={styles.chip}>
                <View style={styles.chipContent}>
                  <Icon
                    name={isProjectExpired ? 'stop-circle-outline' : 'checkmark-circle-outline'}
                    size={12}
                    color={isProjectExpired ? colors.textSecondary : colors.success}
                  />
                  <Text style={styles.chipText}>
                    {isProjectExpired ? 'Proyecto cerrado' : 'Proyecto vigente'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.investmentBanner}>
            <Text style={styles.investmentLabel}>
              {franchise.segment === 'franquicia'
                ? 'INVERSIÓN INICIAL ESTIMADA'
                : 'MONTO DE PARTICIPACIÓN'}
            </Text>
            <Text style={styles.investment}>
              {franchise.soughtAmount != null
                ? franchise.soughtAmount === 0
                  ? 'A convenir'
                  : formatMoney(franchise.soughtAmount, franchise.currency)
                : formatInvestmentRange(franchise.minInvestment, franchise.maxInvestment, franchise.currency)}
            </Text>
          </View>

          {franchise.segment === 'franquicia' && (
            <>
              <Text style={styles.sectionTitle}>Requisitos clave</Text>
              <View style={styles.contactCard}>
                <DetailRow
                  icon="card-outline"
                  label="Royalty"
                  value={formatRoyalty(franchise.royaltyPercentage, franchise.royaltyType)}
                />
                <DetailRow
                  icon="school-outline"
                  label="Capacitación obligatoria"
                  value={`${franchise.trainingWeeks} semanas`}
                />
                {franchise.subtype != null && (
                  <DetailRow
                    icon="map-outline"
                    label="Alcance"
                    value={SUBTYPE_LABELS[franchise.subtype] ?? franchise.subtype}
                  />
                )}
              </View>
              {franchise.estimatedRoi != null && (
                <View style={styles.stats}>
                  <Stat icon="trending-up-outline" label="ROI estimado" value={franchise.estimatedRoi} />
                </View>
              )}
            </>
          )}

          {franchise.segment === 'sociedad' && (
            <View style={styles.stats}>
              <Stat icon="business-outline" label="Tipo" value={SUBTYPE_LABELS[franchise.subtype ?? ''] ?? '—'} />
              {franchise.availablePercentage != null && (
                <Stat icon="pie-chart-outline" label="Participación disponible" value={`${franchise.availablePercentage}%`} />
              )}
            </View>
          )}

          {franchise.segment === 'proyecto' && franchise.projectStart != null && franchise.projectEnd != null && (
            <View style={styles.stats}>
              <Stat icon="calendar-outline" label="Inicio" value={franchise.projectStart} />
              <Stat icon="flag-outline" label="Cierre" value={franchise.projectEnd} />
            </View>
          )}

          {franchise.segment === 'mipe' && franchise.pitch != null && (
            <>
              <Text style={styles.sectionTitle}>Pitch del emprendimiento</Text>
              <Text style={styles.description}>{franchise.pitch}</Text>
            </>
          )}

          <Text style={styles.sectionTitle}>Sobre la oportunidad</Text>
          <Text style={styles.description}>{franchise.description}</Text>

          {franchise.videoUrl != null && franchise.videoUrl.length > 0 && (
            <Button
              title="Ver video del pitch"
              icon="play-circle-outline"
              variant="outline"
              style={{ marginTop: spacing.md, width: undefined }}
              onPress={() => void Linking.openURL(franchise.videoUrl as string)}
            />
          )}

          <Text style={styles.sectionTitle}>Contacto</Text>
          <View style={styles.contactCard}>
            <DetailRow icon="person-outline" label="Responsable" value={franchise.contactName} />
            <DetailRow icon="mail-outline" label="Email" value={franchise.contactEmail} />
            {franchise.contactPhone != null && (
              <DetailRow icon="call-outline" label="Teléfono" value={franchise.contactPhone} />
            )}
            {franchise.website != null && (
              <DetailRow icon="globe-outline" label="Sitio web" value={franchise.website} />
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Conversar"
          icon="logo-whatsapp" variant="outline" onPress={onWhatsApp} />
        <Button
          title={requesting ? 'Enviando...' : 'Solicitar información'}
          disabled={requesting}
          onPress={() => void onRequestInfo()}
        />
      </View>
    </View>
  );
}

function Stat({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={20} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconBox}>
        <Icon name={icon} size={15} color={colors.primary} />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatMoney(amount: number, currency: string): string {
  const symbol = currency === 'USD' ? 'US$ ' : `${currency} `;
  return `${symbol}${amount.toLocaleString('es-BO')}`;
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
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroActions: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
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
  featuredTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  heroViewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 4,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInfo: {
    flex: 1,
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
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chipSupport: {
    backgroundColor: 'rgba(157,80,101,0.16)',
    borderColor: colors.accent,
  },
  chipSupportText: {
    color: '#6E3145',
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
  detailIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(116,12,39,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
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
});
