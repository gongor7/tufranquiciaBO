import { create } from 'zustand';
import { UserRepository } from '../database/repositories/user.repository';
import type { ProfileUpdateDTO, RegistrationDTO, User } from '../types';

interface UserState {
  user: User | null;
  loading: boolean;
  registered: boolean;
  loadProfile: () => Promise<void>;
  register: (dto: RegistrationDTO) => Promise<User>;
  updateProfile: (dto: ProfileUpdateDTO) => Promise<User>;
  isFranquiciador: () => Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  registered: false,

  loadProfile: async () => {
    try {
      const user = await UserRepository.getProfile();
      set({ user, registered: user?.registered === true });
    } finally {
      set({ loading: false });
    }
  },

  register: async (dto) => {
    const updated = await UserRepository.register(dto);
    set({ user: updated, registered: true });
    return updated;
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
