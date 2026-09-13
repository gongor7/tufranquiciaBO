import { z } from 'zod';

/**
 * Esquemas de validación por segmento (spec 002, RF-31/RF-31a).
 * Comparten la base común de identificación/ubicación/contacto y añaden
 * las reglas propias de cada segmento.
 */

const segmentBase = {
  name: z.string().min(1, 'El nombre es obligatorio'),
  tagline: z.string().max(120, 'Máximo 120 caracteres').optional(),
  industry: z.string().min(1, 'La categoría es obligatoria'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  department: z.string().min(1, 'El departamento es obligatorio'),
  city: z.string().min(1, 'La ciudad es obligatoria'),
  website: z.string().url('URL no válida').or(z.literal('')).optional(),
  contactName: z.string().min(1, 'El nombre de contacto es obligatorio'),
  contactEmail: z.string().email('Correo electrónico no válido'),
  contactPhone: z.string().optional(),
  whatsapp: z.string().optional(),
};

const soughtAmount = z.coerce
  .number({ invalid_type_error: 'Monto de participación inválido' })
  .min(0, 'El monto no puede ser negativo');

export const societySchema = z
  .object({
    ...segmentBase,
    subtype: z.enum(['srl', 'sa'], {
      errorMap: () => ({ message: 'Seleccioná el tipo de sociedad (SRL o SA)' }),
    }),
    soughtAmount: soughtAmount,
    availablePercentage: z.coerce
      .number({ invalid_type_error: 'Porcentaje de participación inválido' })
      .min(1, 'El porcentaje debe estar entre 1 y 100')
      .max(100, 'El porcentaje debe estar entre 1 y 100'),
  })
  .superRefine((data, ctx) => {
    if (data.soughtAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['soughtAmount'],
        message: 'Una sociedad debe definir el monto de participación buscado',
      });
    }
  });

export const projectSchema = z
  .object({
    ...segmentBase,
    soughtAmount: soughtAmount,
    projectStart: z.string().min(1, 'La fecha de inicio es obligatoria'),
    projectEnd: z.string().min(1, 'La fecha de fin es obligatoria'),
  })
  .superRefine((data, ctx) => {
    if (data.projectEnd <= data.projectStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['projectEnd'],
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      });
    }
  });

export const mipeSchema = z.object({
  ...segmentBase,
  soughtAmount: soughtAmount.optional(),
  mipeStage: z.enum(['idea', 'validado', 'operativo'], {
    errorMap: () => ({ message: 'Seleccioná la etapa del emprendimiento' }),
  }),
  pitch: z.string().min(10, 'El pitch debe tener al menos 10 caracteres'),
  videoUrl: z.string().url('URL de video no válida').or(z.literal('')).optional(),
  formalizationPlan: z.string().min(10, 'El plan de formalización debe tener al menos 10 caracteres'),
});

export type SocietyFormValues = z.infer<typeof societySchema>;
export type ProjectFormValues = z.infer<typeof projectSchema>;
export type MipeFormValues = z.infer<typeof mipeSchema>;
