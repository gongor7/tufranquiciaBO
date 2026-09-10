import { create } from 'zustand';
import { MessageRepository } from '../database/repositories/message.repository';
import type { ContactMessageDTO, Conversation, Message } from '../types';

interface MessageState {
  conversations: Conversation[];
  loading: boolean;
  sendContactMessage: (dto: ContactMessageDTO) => Promise<Message>;
  loadConversations: () => Promise<void>;
  listByFranchise: (franchiseId: number) => Promise<Message[]>;
  markAsRead: (franchiseId: number) => Promise<void>;
  reply: (franchiseId: number, senderName: string, text: string) => Promise<Message>;
}

export const useMessageStore = create<MessageState>((set) => ({
  conversations: [],
  loading: false,

  sendContactMessage: async (dto) => {
    const message = await MessageRepository.createContactMessage(dto);
    await MessageRepository.markAsRead(dto.franchiseId);
    return message;
  },

  loadConversations: async () => {
    set({ loading: true });
    try {
      const conversations = await MessageRepository.listConversations();
      set({ conversations });
    } finally {
      set({ loading: false });
    }
  },

  listByFranchise: async (franchiseId) => {
    return MessageRepository.listByFranchise(franchiseId);
  },

  markAsRead: async (franchiseId) => {
    await MessageRepository.markAsRead(franchiseId);
    await MessageRepository.listConversations().then((conversations) => {
      set({ conversations });
    });
  },

  reply: async (franchiseId, senderName, text) => {
    const message = await MessageRepository.addReply(franchiseId, senderName, text);
    await MessageRepository.listConversations().then((conversations) => {
      set({ conversations });
    });
    return message;
  },
}));