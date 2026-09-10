import { create } from 'zustand';
import { UserRepository } from '../database/repositories/user.repository';
import type { ProfileUpdateDTO, User } from '../types';

interface UserState {
  user: User | null;
  loading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (dto: ProfileUpdateDTO) => Promise<User>;
  isFranquiciador: () => Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,

  loadProfile: async () => {
    try {
      const user = await UserRepository.getProfile();
      set({ user });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (dto) => {
    const current = get().user;
    if (!current) {
      throw new Error('No hay un perfil de usuario.');
    }
    const updated = await UserRepository.updateProfile(current.id, dto);
    set({ user: updated });
    return updated;
  },

  isFranquiciador: async () => {
    const current = get().user;
    if (current) {
      return current.role === 'franquiciador';
    }
    return UserRepository.isFranquiciador();
  },
}));