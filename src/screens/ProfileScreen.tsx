import { useCallback, useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { colors, spacing, radii, typography } from '../theme';
import { useUserStore } from '../stores/useUserStore';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { useTicketStore } from '../stores/useTicketStore';
import { SUPPORT_WHATSAPP, SUPPORT_PUBLISH_MESSAGE } from '../constants/support';
import { openWhatsApp } from '../utils/links';
import { FormField } from '../components/ui/FormField';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import type { TabScreenProps } from '../navigation/types';

type Props = TabScreenProps<'Profile'>;

const contactSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z
    .string()
    .email('Correo electrónico no válido')
    .or(z.literal(''))
    .optional(),
  phone: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ProfileScreen({ navigation }: Props) {
  const user = useUserStore((s) => s.user);
  const loadProfile = useUserStore((s) => s.loadProfile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const favorites = useFranchiseStore((s) => s.favorites);
  const tickets = useTicketStore((s) => s.tickets);
  const loadTickets = useTicketStore((s) => s.loadTickets);

  const { control, handleSubmit } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  const reload = useCallback(async () => {
    await loadProfile();
    await loadTickets();
  }, [loadProfile, loadTickets]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      void loadTickets();
    }, [loadTickets]),
  );

  const save = handleSubmit(async (values) => {
    if (!user) return;
    await updateProfile({
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      role: user.role,
    });
    Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.');
  });

  const onPublish = () => {
    openWhatsApp(SUPPORT_WHATSAPP, SUPPORT_PUBLISH_MESSAGE);
  };

  const roleLabel = 'Inversionista';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Icon name="person" size={28} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{user?.fullName ?? user?.name ?? 'Inversionista'}</Text>
          <Text style={styles.cardMeta}>
            @{user?.username ?? 'usuario'} · {roleLabel}
          </Text>
          <Text style={styles.cardMeta}>{user?.email ?? 'Sin correo'}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Pressable
          style={styles.statCard}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <View style={styles.statLabelRow}>
            <Icon name="heart-outline" size={14} color={colors.text} />
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <Text style={styles.statAction}>Ver</Text>
        </Pressable>
        <Pressable
          style={styles.statCard}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Tickets' })}
        >
          <Text style={styles.statNumber}>{tickets.length}</Text>
          <View style={styles.statLabelRow}>
            <Icon name="mail-outline" size={14} color={colors.text} />
            <Text style={styles.statLabel}>Solicitudes</Text>
          </View>
          <Text style={styles.statAction}>Ver</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Datos de contacto</Text>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <FormField
            label="Nombre"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField
            label="Correo electrónico"
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <FormField
            label="Teléfono"
            placeholder="+591 ..."
            keyboardType="phone-pad"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Button title="Guardar cambios" onPress={() => void save()} />

      <Pressable style={styles.publishCta} onPress={onPublish}>
        <View style={styles.publishIconBox}>
          <Icon name="megaphone-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.publishTitle}>Quiero publicar mi negocio</Text>
          <Text style={styles.publishText}>
            Franquicias, sociedades, proyectos y emprendimientos se registran con
            acompañamiento de nuestro equipo por WhatsApp.
          </Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(179,121,136,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  statAction: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  publishCta: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157,80,101,0.16)',
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  publishIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  publishText: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
