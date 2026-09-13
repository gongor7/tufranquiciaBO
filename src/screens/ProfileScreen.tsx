import { useCallback, useEffect } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors, spacing, radii, typography } from '../theme';
import { useUserStore } from '../stores/useUserStore';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { useMessageStore } from '../stores/useMessageStore';
import { FormField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { profileSchema, ProfileFormValues } from '../utils/validators';
import type { TabScreenProps } from '../navigation/types';

type Props = TabScreenProps<'Profile'>;

const roleOptions = [
  { label: 'Inversionista', value: 'inversionista' },
  { label: 'Franquiciador', value: 'franquiciador' },
];

export function ProfileScreen({ navigation }: Props) {
  const user = useUserStore((s) => s.user);
  const loadProfile = useUserStore((s) => s.loadProfile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const favorites = useFranchiseStore((s) => s.favorites);
  const conversations = useMessageStore((s) => s.conversations);

  const inquiries = conversations.length;

  const { control, handleSubmit } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      role: user?.role ?? 'inversionista',
    },
  });

  const reload = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = handleSubmit(async (values) => {
    await updateProfile({
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      role: values.role,
    });
    Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.');
  });

  const email = user?.email ?? 'Sin email configurado';
  const roleLabel = user?.role === 'franquiciador' ? 'Franquiciador' : 'Inversionista';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.role === 'franquiciador' ? '🏢' : '👤'}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Cargando...'}</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.role}>Rol: {roleLabel}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
          <Button
            title="Ver"
            size="sm"
            variant="outline"
            onPress={() => navigation.navigate('Favorites')}
            style={{ width: 90 }}
          />
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{inquiries}</Text>
          <Text style={styles.statLabel}>Consultas</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{'0'}</Text>
          <Text style={styles.statLabel}>Publicadas</Text>
          <Button
            title="Registrar"
            size="sm"
            variant="outline"
            onPress={() => navigation.navigate('Register')}
            style={{ width: 90 }}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Editar información</Text>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <FormField
            label="Nombre *"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <FormField
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <FormField
            label="Teléfono"
            keyboardType="phone-pad"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <Select
            label="Rol *"
            selectedValue={field.value}
            options={roleOptions}
            onSelect={field.onChange}
          />
        )}
      />

      <Button title="Guardar cambios" onPress={() => void save()} />

      <Pressable
        style={styles.ajuda}
        onPress={() => {
          Alert.alert(
            'Registro de oportunidades',
            'Para publicar una franquicia, sociedad, proyecto o MIPE tu rol debe ser "Franquiciador". Cambia el rol aquí y guarda.',
          );
        }}
      >
        <Text style={styles.ajudaText}>¿Cómo registro una oportunidad?</Text>
      </Pressable>
    </View>
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
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 34,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  role: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    padding: spacing.md,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  ajuda: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  ajudaText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});