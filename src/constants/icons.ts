import type { IconName } from '../components/ui/Icon';
import type { Segment } from '../types';

/** Icono por industria (reemplaza los emojis de datos). */
export const INDUSTRY_ICONS: Record<string, IconName> = {
  comida: 'restaurant-outline',
  retail: 'shirt-outline',
  servicios: 'construct-outline',
  educacion: 'book-outline',
  tecnologia: 'laptop-outline',
  salud: 'medkit-outline',
  fitness: 'barbell-outline',
  belleza: 'sparkles-outline',
  distribución: 'cube-outline',
  manufactura: 'hardware-chip-outline',
  agroindustria: 'leaf-outline',
  eventos: 'calendar-outline',
};

export function getIndustryIcon(industry: string): IconName {
  return INDUSTRY_ICONS[industry] ?? 'business-outline';
}

/** Icono por vertical/segmento. */
export const SEGMENT_ICONS: Record<Segment, IconName> = {
  franquicia: 'storefront-outline',
  sociedad: 'business-outline',
  proyecto: 'git-network-outline',
  mipe: 'trending-up-outline',
};

export const SEGMENT_ICONS_FILLED: Record<Segment, IconName> = {
  franquicia: 'storefront',
  sociedad: 'business',
  proyecto: 'git-network',
  mipe: 'trending-up',
};
