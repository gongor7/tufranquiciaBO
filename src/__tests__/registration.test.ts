import { createTestDb } from '../test-utils';
import { UserRepository } from '../database/repositories/user.repository';
import { registrationSchema } from '../utils/validators';

const validRegistration = {
  fullName: 'Cristhian Góngora',
  username: 'cgongora',
  email: 'cristhian@ejemplo.bo',
  phone: '+591 70011122',
  acceptedTerms: true,
};

describe('T27: registro obligatorio (RF-37, RF-38, RF-39)', () => {
  beforeEach(async () => {
    await createTestDb();
  });

  describe('registrationSchema', () => {
    it('acepta un registro válido con términos aceptados', () => {
      const result = registrationSchema.safeParse(validRegistration);
      expect(result.success).toBe(true);
    });

    it('rechaza si los términos no están aceptados (RF-38)', () => {
      const result = registrationSchema.safeParse({ ...validRegistration, acceptedTerms: false });
      expect(result.success).toBe(false);
    });

    it('rechaza campos vacíos o correo inválido (RF-38)', () => {
      expect(
        registrationSchema.safeParse({ ...validRegistration, fullName: '' }).success,
      ).toBe(false);
      expect(
        registrationSchema.safeParse({ ...validRegistration, username: '' }).success,
      ).toBe(false);
      expect(
        registrationSchema.safeParse({ ...validRegistration, email: 'no-es-correo' }).success,
      ).toBe(false);
      expect(
        registrationSchema.safeParse({ ...validRegistration, phone: '' }).success,
      ).toBe(false);
    });
  });

  describe('UserRepository', () => {
    it('por defecto el usuario NO está registrado (RF-37)', async () => {
      expect(await UserRepository.isRegistered()).toBe(false);
    });

    it('register persiste datos, términos y marca registrado (RF-39)', async () => {
      const user = await UserRepository.register(validRegistration);

      expect(user.registered).toBe(true);
      expect(user.acceptedTerms).toBe(true);
      expect(user.fullName).toBe('Cristhian Góngora');
      expect(user.username).toBe('cgongora');
      expect(user.role).toBe('inversionista');

      expect(await UserRepository.isRegistered()).toBe(true);
      const profile = await UserRepository.getProfile();
      expect(profile?.email).toBe('cristhian@ejemplo.bo');
      expect(profile?.phone).toBe('+591 70011122');
    });
  });
});
