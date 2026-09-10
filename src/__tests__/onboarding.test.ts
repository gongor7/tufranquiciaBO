import { createTestDb } from '../test-utils';
import { OnboardingRepository } from '../database/repositories/onboarding.repository';

describe('Onboarding (RF-1, RF-2)', () => {
  beforeEach(async () => {
    await createTestDb();
  });

  it('la primera vez el onboarding está pendiente (RF-1)', async () => {
    expect(await OnboardingRepository.isCompleted()).toBe(false);
  });

  it('al completarlo queda persistido y no vuelve a mostrarse (RF-2)', async () => {
    await OnboardingRepository.setCompleted();
    expect(await OnboardingRepository.isCompleted()).toBe(true);
  });

  it('permanece completado a través de una nueva instancia del repositorio', async () => {
    await OnboardingRepository.setCompleted();
    const again = await OnboardingRepository.isCompleted();
    expect(again).toBe(true);
  });
});