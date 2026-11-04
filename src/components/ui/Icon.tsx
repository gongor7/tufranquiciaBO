import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export type IconName = keyof typeof Ionicons.glyphMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * Iconografía central de la app (Ionicons). Reemplaza los emojis de la UI
 * para un look profesional consistente (spec 003, T34).
 */
export function Icon({ name, size = 20, color = colors.text }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
