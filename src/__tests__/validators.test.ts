import {
  contactMessageSchema,
  createFranchiseSchema,
  createFranchiseBaseSchema,
  profileSchema,
} from '../utils/validators';

describe('Validadores Zod (RF-13, RF-15)', () => {
  describe('contactMessageSchema', () => {
    it('acepta un mensaje válido', () => {
      const result = contactMessageSchema.safeParse({
        franchiseId: 1,
        senderName: 'Ana',
        senderEmail: 'ana@ejemplo.com',
        message: 'Hola, quiero más información.',
      });
      expect(result.success).toBe(true);
    });

    it('rechaza nombre vacío, email inválido y mensaje vacío (RF-13)', () => {
      const result = contactMessageSchema.safeParse({
        franchiseId: 1,
        senderName: '',
        senderEmail: 'no-es-email',
        message: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((issue) => issue.path[0]);
        expect(paths).toContain('senderName');
        expect(paths).toContain('senderEmail');
        expect(paths).toContain('message');
      }
    });
  });

  describe('createFranchiseSchema', () => {
    const validBase = {
      name: 'Pizza Norte',
      industry: 'comida',
      description: 'Pizzería artesanal con horno de piedra en el centro.',
      department: 'La Paz',
      city: 'La Paz',
      minInvestment: 10000,
      maxInvestment: 20000,
      royaltyPercentage: 5,
      employeesRequired: 3,
      trainingWeeks: 2,
      supportLevel: 'basico',
      contactName: 'Juan Pérez',
      contactEmail: 'juan@ejemplo.com',
    };

    it('acepta una franquicia válida', () => {
      const result = createFranchiseSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it('rechaza inversión mínima mayor que la máxima (RF-15)', () => {
      const result = createFranchiseSchema.safeParse({
        ...validBase,
        minInvestment: 30000,
        maxInvestment: 10000,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path[0] === 'maxInvestment')).toBe(true);
      }
    });

    it('rechaza royalty fuera de 0-100 (RF-15)', () => {
      const badHigh = createFranchiseSchema.safeParse({ ...validBase, royaltyPercentage: 250 });
      const badLow = createFranchiseSchema.safeParse({ ...validBase, royaltyPercentage: -5 });
      expect(badHigh.success).toBe(false);
      expect(badLow.success).toBe(false);
    });

    it('no avanza si los campos obligatorios están vacíos (RF-15)', () => {
      const result = createFranchiseBaseSchema
        .pick({ name: true, description: true })
        .safeParse({ name: '', description: 'x' });
      expect(result.success).toBe(false);
    });
  });

  describe('profileSchema', () => {
    it('acepta un perfil válido con rol franquiciador', () => {
      const result = profileSchema.safeParse({ name: 'Ana', role: 'franquiciador', email: '' });
      expect(result.success).toBe(true);
    });

    it('rechaza un rol no permitido', () => {
      const result = profileSchema.safeParse({ name: 'Ana', role: 'admin' });
      expect(result.success).toBe(false);
    });
  });
});