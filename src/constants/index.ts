export interface Industry {
  id: string;
  label: string;
  emoji: string;
}

export const industries: Industry[] = [
  { id: 'comida', label: 'Comida y Bebida', emoji: '🍔' },
  { id: 'retail', label: 'Retail y Moda', emoji: '🛍️' },
  { id: 'servicios', label: 'Servicios', emoji: '💼' },
  { id: 'educacion', label: 'Educación', emoji: '📚' },
  { id: 'tecnologia', label: 'Tecnología', emoji: '🔧' },
  { id: 'salud', label: 'Salud y Bienestar', emoji: '🏥' },
  { id: 'fitness', label: 'Fitness', emoji: '🏋️' },
  { id: 'belleza', label: 'Belleza', emoji: '💄' },
];

export function getIndustry(id: string): Industry | undefined {
  return industries.find((i) => i.id === id);
}

export function getIndustryLabel(id: string): string {
  return getIndustry(id)?.label ?? id;
}

export const departments = [
  'La Paz',
  'Santa Cruz',
  'Cochabamba',
  'Sucre',
  'Oruro',
  'Potosí',
  'Tarija',
  'Beni',
  'Pando',
] as const;