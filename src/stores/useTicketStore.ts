import { create } from 'zustand';
import { TicketRepository } from '../database/repositories/ticket.repository';
import type { Ticket } from '../types';

interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  loadTickets: () => Promise<void>;
  createTicket: (franchiseId: number) => Promise<Ticket>;
  countNew: () => Promise<number>;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  loading: false,

  loadTickets: async () => {
    set({ loading: true });
    try {
      const tickets = await TicketRepository.list();
      set({ tickets });
    } finally {
      set({ loading: false });
    }
  },

  createTicket: async (franchiseId) => {
    const ticket = await TicketRepository.createFromProfile(franchiseId);
    await get().loadTickets();
    return ticket;
  },

  countNew: async () => TicketRepository.countByStatus('nuevo'),
}));
