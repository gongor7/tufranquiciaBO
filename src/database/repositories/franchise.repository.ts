import { getExecutor } from '..';
import { buildWhereClause, buildOrderBy, BASE_SELECT, mapFranchiseRow, FranchiseRow } from '../franchiseQueries';
import type { CreateFranchiseDTO, CreateOpportunityDTO, Filters, Franchise, Milestone } from '../../types';
import { slugify } from '../../utils/formatters';

export const FranchiseRepository = {
  async findAll(filters: Filters): Promise<Franchise[]> {
    const { clause, params } = buildWhereClause(filters);
    const order = buildOrderBy(filters.sortBy);
    const sql = `${BASE_SELECT} ${clause} ORDER BY ${order}`;
    const rows = await getExecutor().getAll<FranchiseRow>(sql, params);
    return rows.map(mapFranchiseRow);
  },

  async findById(id: number): Promise<Franchise | null> {
    const rows = await getExecutor().getAll<FranchiseRow>(
      `${BASE_SELECT} WHERE f.id = ?`,
      [id],
    );
    return rows.length > 0 ? mapFranchiseRow(rows[0]) : null;
  },

  async getFeatured(): Promise<Franchise[]> {
    const rows = await getExecutor().getAll<FranchiseRow>(
      `${BASE_SELECT} WHERE f.featured = 1 AND f.status = 'activa' ORDER BY f.views_count DESC LIMIT 3`,
    );
    return rows.map(mapFranchiseRow);
  },

  async getPopular(limit = 10): Promise<Franchise[]> {
    const rows = await getExecutor().getAll<FranchiseRow>(
      `${BASE_SELECT} WHERE f.status = 'activa' ORDER BY f.views_count DESC, f.id DESC LIMIT ${limit}`,
    );
    return rows.map(mapFranchiseRow);
  },

  async incrementViews(id: number): Promise<void> {
    await getExecutor().run('UPDATE franchises SET views_count = views_count + 1 WHERE id = ?', [id]);
  },

  async create(dto: CreateFranchiseDTO & Partial<CreateOpportunityDTO>): Promise<Franchise> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await getExecutor().getAll<{ id: number }>(
        'SELECT id FROM franchises WHERE slug = ?',
        [slug],
      );
      if (existing.length === 0) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const result = await getExecutor().run(
      `INSERT INTO franchises (
        user_id, name, slug, logo_emoji, tagline, description, industry,
        industry_emoji, country, department, city, min_investment, max_investment,
        currency, royalty_percentage, royalty_type, estimated_roi, employees_required,
        training_weeks, support_level, website, contact_name, contact_email,
        contact_phone, whatsapp, featured, status, views_count, inquiries_count,
        created_at, updated_at, segment, subtype, sought_amount,
        available_percentage, project_start, project_end, mipe_stage, pitch,
        video_url, formalization_plan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        null,
        dto.name,
        slug,
        '🏢',
        dto.tagline ?? null,
        dto.description,
        dto.industry,
        '📁',
        'Bolivia',
        dto.department,
        dto.city,
        dto.minInvestment,
        dto.maxInvestment,
        'USD',
        dto.royaltyPercentage ?? 0,
        'mensual',
        dto.estimatedRoi ?? null,
        dto.employeesRequired ?? 1,
        dto.trainingWeeks ?? 1,
        dto.supportLevel ?? 'basico',
        dto.website || null,
        dto.contactName,
        dto.contactEmail,
        dto.contactPhone ?? null,
        dto.whatsapp ?? null,
        0,
        'activa',
        0,
        0,
        now,
        now,
        dto.segment ?? 'franquicia',
        dto.subtype ?? null,
        dto.soughtAmount ?? null,
        dto.availablePercentage ?? null,
        dto.projectStart ?? null,
        dto.projectEnd ?? null,
        dto.mipeStage ?? null,
        dto.pitch ?? null,
        dto.videoUrl ?? null,
        dto.formalizationPlan ?? null,
      ],
    );

    const id = result.lastInsertId ?? 0;
    return mapFranchiseRow(await this.rawById(id));
  },

  async rawById(id: number): Promise<FranchiseRow> {
    const rows = await getExecutor().getAll<FranchiseRow>(
      `${BASE_SELECT} WHERE f.id = ?`,
      [id],
    );
    return rows[0];
  },

  async getMilestones(franchiseId: number): Promise<Milestone[]> {
    const rows = await getExecutor().getAll<{
      id: number;
      franchise_id: number;
      position: number;
      title: string;
      target_date: string | null;
      completed: number;
    }>(
      'SELECT id, franchise_id, position, title, target_date, completed FROM milestones WHERE franchise_id = ? ORDER BY position, id',
      [franchiseId],
    );
    return rows.map((r) => ({
      id: r.id,
      franchiseId: r.franchise_id,
      position: r.position,
      title: r.title,
      targetDate: r.target_date,
      completed: r.completed === 1,
    }));
  },
};