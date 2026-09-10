import { create } from 'zustand';
import { OnboardingRepository } from '../database/repositories/onboarding.repository';

interface OnboardingState {
  isCompleted: boolean;
  loading: boolean;
  check: () => Promise<void>;
  complete: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isCompleted: false,
  loading: true,
  check: async () => {
    try {
      const completed = await OnboardingRepository.isCompleted();
      set({ isCompleted: completed });
    } finally {
      set({ loading: false });
    }
  },
  complete: async () => {
    await OnboardingRepository.setCompleted();
    set({ isCompleted: true });
  },
}));