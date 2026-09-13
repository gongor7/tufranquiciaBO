import type { Segment } from '../types';

export const SEGMENTS: { id: Segment; label: string; emoji: string }[] = [
  { id: 'franquicia', label: 'Franquicias', emoji: '🏪' },
  { id: 'sociedad', label: 'Sociedades', emoji: '🏛️' },
  { id: 'proyecto', label: 'Proyectos', emoji: '🎪' },
  { id: 'mipe', label: 'MIPEs', emoji: '🌱' },
];

export function getSegment(id: Segment) {
  return SEGMENTS.find((s) => s.id === id);
}

export const SEGMENT_LABELS: Record<Segment, string> = {
  franquicia: 'Franquicia',
  sociedad: 'Sociedad',
  proyecto: 'Proyecto',
  mipe: 'MIPE',
};

export const SUBTYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  departamental: 'Departamental',
  nacional: 'Nacional',
  srl: 'SRL — capital social',
  sa: 'SA — acciones',
};

export const MIPE_STAGE_LABELS: Record<string, string> = {
  idea: 'En idea',
  validado: 'Validado',
  operativo: 'Operativo',
};
