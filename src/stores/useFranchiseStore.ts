import { create } from 'zustand';
import { FranchiseRepository } from '../database/repositories/franchise.repository';
import { FavoriteRepository } from '../database/repositories/favorite.repository';
import type { Filters, Franchise } from '../types';

interface FranchiseState {
  franchises: Franchise[];
  featured: Franchise[];
  popular: Franchise[];
  favorites: number[];
  filters: Filters;
  loading: boolean;
  setFilters: (partial: Partial<Filters>) => void;
  loadFranchises: () => Promise<void>;
  refresh: () => Promise<void>;
  loadFeatured: () => Promise<void>;
  loadPopular: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (franchiseId: number) => Promise<boolean>;
  incrementViews: (franchiseId: number) => Promise<void>;
  clearFilters: () => void;
}

const defaultFilters: Filters = { sortBy: 'recent' };

export const useFranchiseStore = create<FranchiseState>((set, get) => ({
  franchises: [],
  featured: [],
  popular: [],
  favorites: [],
  filters: { ...defaultFilters },
  loading: false,

  setFilters: (partial) => {
    const next = { ...get().filters, ...partial };
    set({ filters: next });
    void get().loadFranchises();
  },

  clearFilters: () => {
    set({ filters: { ...defaultFilters } });
    void get().loadFranchises();
  },

  loadFranchises: async () => {
    set({ loading: true });
    try {
      const franchises = await FranchiseRepository.findAll(get().filters);
      set({ franchises });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    await get().loadFranchises();
    await get().loadFavorites();
  },

  loadFeatured: async () => {
    const featured = await FranchiseRepository.getFeatured();
    set({ featured });
  },

  loadPopular: async () => {
    const popular = await FranchiseRepository.getPopular(10);
    set({ popular });
  },

  loadFavorites: async () => {
    const favorites = await FavoriteRepository.listIds();
    set({ favorites });
  },

  toggleFavorite: async (franchiseId) => {
    const newState = await FavoriteRepository.toggle(franchiseId);
    const favorites = await FavoriteRepository.listIds();
    set({ favorites });
    set((state) => ({
      franchises: state.franchises.map((f) =>
        f.id === franchiseId ? { ...f, isFavorite: newState } : f,
      ),
      featured: state.featured.map((f) =>
        f.id === franchiseId ? { ...f, isFavorite: newState } : f,
      ),
      popular: state.popular.map((f) =>
        f.id === franchiseId ? { ...f, isFavorite: newState } : f,
      ),
    }));
    return newState;
  },

  incrementViews: async (franchiseId) => {
    await FranchiseRepository.incrementViews(franchiseId);
  },
}));