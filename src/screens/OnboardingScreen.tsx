import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import { Button } from '../components/ui/Button';
import { useOnboardingStore } from '../stores/useOnboardingStore';
import type { StackScreenProps } from '../navigation/types';

type Props = StackScreenProps<'Onboarding'>;

const slides = [
  {
    emoji: '🏢',
    title: 'Bienvenido a TuFranquiciaBO',
    text: 'La plataforma que conecta inversionistas con franquicias disponibles en Bolivia.',
  },
  {
    emoji: '🔍',
    title: 'Explora sin límites',
    text: 'Busca por categoría, departamento y rango de inversión. Encuentra la oportunidad ideal para ti.',
  },
  {
    emoji: '💬',
    title: 'Contacta directo',
    text: 'Envía consultas y conversa con cada franquiciador en un chat simple y organizado.',
  },
  {
    emoji: '🚀',
    title: 'Publica tu franquicia',
    text: 'Si eres franquiciador, registra tu negocio en 4 pasos y empieza a recibir consultas.',
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const complete = useOnboardingStore((s) => s.complete);
  const [index, setIndex] = useStep(0);

  const isLast = index === slides.length - 1;

  const finish = async () => {
    await complete();
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const next = () => {
    if (isLast) {
      void finish();
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 88 }}>{slides[index].emoji}</Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: colors.primary,
            textAlign: 'center',
            marginTop: 24,
          }}
        >
          {slides[index].title}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            marginTop: 12,
          }}
        >
          {slides[index].text}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: 4,
              backgroundColor: i === index ? colors.accent : colors.border,
            }}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <Button title={isLast ? 'Comenzar' : 'Siguiente'} onPress={next} />
        {!isLast && (
          <Button
            title="Saltar"
            variant="ghost"
            onPress={() => void finish()}
          />
        )}
      </View>
    </View>
  );
}

function useStep(initial: number) {
  const [value, setValue] = useState(initial);
  return [value, setValue] as const;
}