export type Role = 'inversionista' | 'franquiciador';
export type SupportLevel = 'basico' | 'avanzado' | 'premium';
export type RoyaltyType = 'mensual' | 'anual';
export type FranchiseStatus = 'activa' | 'pausada' | 'cerrada';
export type SortBy = 'recent' | 'popular' | 'investment' | 'investmentDesc';

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Franchise {
  id: number;
  userId: number | null;
  name: string;
  slug: string;
  logoEmoji: string;
  tagline: string | null;
  description: string;
  industry: string;
  industryEmoji: string;
  country: string;
  department: string;
  city: string;
  minInvestment: number;
  maxInvestment: number;
  currency: string;
  royaltyPercentage: number;
  royaltyType: RoyaltyType;
  estimatedRoi: string | null;
  employeesRequired: number;
  trainingWeeks: number;
  supportLevel: SupportLevel;
  website: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  whatsapp: string | null;
  featured: boolean;
  status: FranchiseStatus;
  viewsCount: number;
  inquiriesCount: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  franchiseId: number;
  senderName: string;
  senderEmail: string | null;
  senderPhone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  franchiseId: number;
  franchiseName: string;
  logoEmoji: string;
  lastMessage: string;
  lastActivity: string;
  unreadCount: number;
}

export interface CreateFranchiseDTO {
  name: string;
  tagline?: string;
  industry: string;
  description: string;
  department: string;
  city: string;
  minInvestment: number;
  maxInvestment: number;
  royaltyPercentage: number;
  estimatedRoi?: string;
  employeesRequired: number;
  trainingWeeks: number;
  supportLevel: SupportLevel;
  website?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  whatsapp?: string;
}

export interface ContactMessageDTO {
  franchiseId: number;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
}

export interface Filters {
  text?: string;
  industry?: string;
  department?: string;
  minInvestment?: number;
  maxInvestment?: number;
  sortBy: SortBy;
}

export interface ProfileUpdateDTO {
  name: string;
  email?: string;
  phone?: string;
  role: Role;
}