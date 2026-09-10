import { z } from 'zod';

export const contactMessageSchema = z.object({
  franchiseId: z.number().int().positive(),
  senderName: z.string().min(1, 'El nombre es obligatorio'),
  senderEmail: z.string().email('Correo electrónico no válido'),
  senderPhone: z.string().optional(),
  message: z.string().min(1, 'El mensaje es obligatorio'),
});

export const createFranchiseBaseSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  tagline: z.string().max(120, 'Máximo 120 caracteres').optional(),
  industry: z.string().min(1, 'La categoría es obligatoria'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  department: z.string().min(1, 'El departamento es obligatorio'),
  city: z.string().min(1, 'La ciudad es obligatoria'),
  minInvestment: z.coerce
    .number({ invalid_type_error: 'Inversión mínima inválida' })
    .positive('Debe ser un monto positivo'),
  maxInvestment: z.coerce
    .number({ invalid_type_error: 'Inversión máxima inválida' })
    .positive('Debe ser un monto positivo'),
  royaltyPercentage: z.coerce
    .number({ invalid_type_error: 'Royalty inválido' })
    .min(0, 'Mínimo 0')
    .max(100, 'Máximo 100'),
  estimatedRoi: z.string().optional(),
  employeesRequired: z.coerce.number().int().min(1, 'Mínimo 1 empleado'),
  trainingWeeks: z.coerce.number().int().min(1, 'Mínimo 1 semana'),
  supportLevel: z.enum(['basico', 'avanzado', 'premium']),
  website: z
    .string()
    .url('URL no válida')
    .or(z.literal(''))
    .optional(),
  contactName: z.string().min(1, 'El nombre de contacto es obligatorio'),
  contactEmail: z.string().email('Correo electrónico no válido'),
  contactPhone: z.string().optional(),
  whatsapp: z.string().optional(),
});

export const createFranchiseSchema = createFranchiseBaseSchema.superRefine((data, ctx) => {
    if (data.maxInvestment < data.minInvestment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxInvestment'],
        message: 'La inversión máxima no puede ser menor que la mínima',
      });
    }
  });

export const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z
    .string()
    .email('Correo electrónico no válido')
    .or(z.literal(''))
    .optional(),
  phone: z.string().optional(),
  role: z.enum(['inversionista', 'franquiciador']),
});

export type ContactMessageFormValues = z.infer<typeof contactMessageSchema>;
export type CreateFranchiseFormValues = z.infer<typeof createFranchiseSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;