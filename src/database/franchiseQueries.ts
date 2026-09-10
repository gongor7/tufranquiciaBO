import type { Franchise, Filters, SortBy } from '../types';

export interface FranchiseRow {
  id: number;
  user_id: number | null;
  name: string;
  slug: string;
  logo_emoji: string;
  tagline: string | null;
  description: string;
  industry: string;
  industry_emoji: string;
  country: string;
  department: string;
  city: string;
  min_investment: number;
  max_investment: number;
  currency: string;
  royalty_percentage: number;
  royalty_type: string;
  estimated_roi: string | null;
  employees_required: number;
  training_weeks: number;
  support_level: string;
  website: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  whatsapp: string | null;
  featured: number;
  status: string;
  views_count: number;
  inquiries_count: number;
  created_at: string;
  updated_at: string;
  is_favorite: number;
}

export function mapFranchiseRow(row: FranchiseRow): Franchise {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    slug: row.slug,
    logoEmoji: row.logo_emoji,
    tagline: row.tagline,
    description: row.description,
    industry: row.industry,
    industryEmoji: row.industry_emoji,
    country: row.country,
    department: row.department,
    city: row.city,
    minInvestment: row.min_investment,
    maxInvestment: row.max_investment,
    currency: row.currency,
    royaltyPercentage: row.royalty_percentage,
    royaltyType: row.royalty_type as Franchise['royaltyType'],
    estimatedRoi: row.estimated_roi,
    employeesRequired: row.employees_required,
    trainingWeeks: row.training_weeks,
    supportLevel: row.support_level as Franchise['supportLevel'],
    website: row.website,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    whatsapp: row.whatsapp,
    featured: row.featured === 1,
    status: row.status as Franchise['status'],
    viewsCount: row.views_count,
    inquiriesCount: row.inquiries_count,
    isFavorite: row.is_favorite === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const BASE_SELECT = `
  SELECT f.*, CASE WHEN fav.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite
  FROM franchises f
  LEFT JOIN favorites fav ON fav.franchise_id = f.id
`;

export function buildWhereClause(filters: Omit<Filters, 'sortBy'>): {
  clause: string;
  params: (string | number | null)[];
} {
  const clauses: string[] = [];
  const params: (string | number | null)[] = [];

  if (filters.text && filters.text.trim().length > 0) {
    clauses.push('(LOWER(f.name) LIKE ? OR LOWER(f.description) LIKE ?)');
    const like = `%${filters.text.trim().toLowerCase()}%`;
    params.push(like, like);
  }
  if (filters.industry && filters.industry.length > 0) {
    clauses.push('f.industry = ?');
    params.push(filters.industry);
  }
  if (filters.department && filters.department.length > 0) {
    clauses.push('f.department = ?');
    params.push(filters.department);
  }
  if (filters.minInvestment != null) {
    clauses.push('f.max_investment >= ?');
    params.push(filters.minInvestment);
  }
  if (filters.maxInvestment != null) {
    clauses.push('f.min_investment <= ?');
    params.push(filters.maxInvestment);
  }

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

export function buildOrderBy(sortBy: SortBy): string {
  switch (sortBy) {
    case 'recent':
      return 'f.created_at DESC, f.id DESC';
    case 'popular':
      return 'f.views_count DESC, f.id DESC';
    case 'investment':
      return 'f.min_investment ASC, f.id ASC';
    case 'investmentDesc':
      return 'f.min_investment DESC, f.id DESC';
    default:
      return 'f.created_at DESC, f.id DESC';
  }
}