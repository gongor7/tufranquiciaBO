import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import { Button } from '../components/ui/Button';
import { Icon, IconName } from '../components/ui/Icon';
import { useOnboardingStore } from '../stores/useOnboardingStore';
import type { StackScreenProps } from '../navigation/types';

type Props = StackScreenProps<'Onboarding'>;

const slides: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'business',
    title: 'Bienvenido a TuFranquiciaBO',
    text: 'La plataforma que conecta inversionistas con oportunidades de inversión en Bolivia: franquicias, sociedades, proyectos y emprendimientos.',
  },
  {
    icon: 'search',
    title: 'Explora sin límites',
    text: 'Navega por vertical, departamento y búsqueda libre. Guarda tus oportunidades favoritas con un toque.',
  },
  {
    icon: 'logo-whatsapp',
    title: 'Contacto directo',
    text: 'Solicita información con un solo toque y conversa por WhatsApp con el responsable de cada oportunidad.',
  },
  {
    icon: 'trending-up',
    title: 'Invierte con criterio',
    text: 'Compara inversión, royalty y requisitos clave de cada oportunidad para decidir con datos.',
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
        <View
          style={{
            width: 110,
            height: 110,
            borderRadius: 32,
            backgroundColor: 'rgba(116,12,39,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Icon name={slides[index].icon} size={52} color={colors.primary} />
        </View>
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