import {
  societySchema,
  projectSchema,
  mipeSchema,
} from '../utils/segmentValidators';

const baseCommon = {
  name: 'Oportunidad de prueba',
  description: 'Descripción suficientemente larga para pasar la validación.',
  industry: 'salud',
  department: 'La Paz',
  city: 'La Paz',
  contactName: 'Contacto',
  contactEmail: 'contacto@prueba.bo',
};

describe('T19: validadores por segmento (RF-31, RF-31a)', () => {
  describe('societySchema', () => {
    it('acepta una sociedad válida', () => {
      const result = societySchema.safeParse({
        ...baseCommon,
        subtype: 'srl',
        soughtAmount: 90000,
        availablePercentage: 30,
      });
      expect(result.success).toBe(true);
    });

    it('rechaza porcentaje de participación fuera de 1-100', () => {
      const cero = societySchema.safeParse({
        ...baseCommon,
        soughtAmount: 90000,
        availablePercentage: 0,
      });
      expect(cero.success).toBe(false);

      const cien = societySchema.safeParse({
        ...baseCommon,
        soughtAmount: 90000,
        availablePercentage: 101,
      });
      expect(cien.success).toBe(false);
    });

    it('rechaza monto de participación negativo o vacío', () => {
      const negativo = societySchema.safeParse({
        ...baseCommon,
        soughtAmount: -1,
        availablePercentage: 10,
      });
      expect(negativo.success).toBe(false);
    });
  });

  describe('projectSchema', () => {
    it('acepta un proyecto con vigencia correcta', () => {
      const result = projectSchema.safeParse({
        ...baseCommon,
        soughtAmount: 15000,
        projectStart: '2026-10-01',
        projectEnd: '2026-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('rechaza fecha fin anterior a fecha inicio', () => {
      const result = projectSchema.safeParse({
        ...baseCommon,
        soughtAmount: 15000,
        projectStart: '2026-12-01',
        projectEnd: '2026-10-01',
      });
      expect(result.success).toBe(false);
    });

    it('exige ambas fechas', () => {
      const sinFechas = projectSchema.safeParse({ ...baseCommon, soughtAmount: 15000 });
      expect(sinFechas.success).toBe(false);
    });
  });

  describe('mipeSchema', () => {
    it('acepta un MIPE con monto 0 y perfil completo', () => {
      const result = mipeSchema.safeParse({
        ...baseCommon,
        soughtAmount: 0,
        mipeStage: 'validado',
        pitch: 'Pitch del emprendimiento con tracción real.',
        videoUrl: 'https://www.youtube.com/watch?v=pitch',
        formalizationPlan: 'Constitución ante SEPREC en el mes 1.',
      });
      expect(result.success).toBe(true);
    });

    it('acepta MIPE sin monto definido', () => {
      const result = mipeSchema.safeParse({
        ...baseCommon,
        mipeStage: 'idea',
        pitch: 'Pitch inicial.',
        formalizationPlan: 'Plan básico.',
      });
      expect(result.success).toBe(true);
    });

    it('exige etapa, pitch y plan de formalización', () => {
      const incompleto = mipeSchema.safeParse({ ...baseCommon, soughtAmount: 0 });
      expect(incompleto.success).toBe(false);
    });

    it('rechaza video con URL inválida', () => {
      const result = mipeSchema.safeParse({
        ...baseCommon,
        soughtAmount: 0,
        mipeStage: 'idea',
        pitch: 'Pitch.',
        formalizationPlan: 'Plan.',
        videoUrl: 'no-es-una-url',
      });
      expect(result.success).toBe(false);
    });
  });
});
