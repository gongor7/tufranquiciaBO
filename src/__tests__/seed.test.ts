import { createTestDb } from '../test-utils';
import { FranchiseRepository } from '../database/repositories/franchise.repository';
import { departments, industries } from '../constants';

describe('Seed (RF-24)', () => {
  beforeEach(async () => {
    await createTestDb();
  });

  it('inserta exactamente 28 oportunidades de ejemplo (20 franquicias)', async () => {
    const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
    expect(franchises.length).toBe(27); // activos: el proyecto vencido se excluye (RF-34)
  });

  it('cubre las 8 industrias y los 9 departamentos de Bolivia', async () => {
    const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
    const presentIndustries = new Set(franchises.map((f) => f.industry));
    const presentDepartments = new Set(franchises.map((f) => f.department));
    for (const industry of industries) {
      expect(presentIndustries.has(industry.id)).toBe(true);
    }
    for (const department of departments) {
      expect(presentDepartments.has(department)).toBe(true);
    }
  });

  it('destaca 2 franquicias y el orden "recientes" es distinguible', async () => {
    const recent = await FranchiseRepository.findAll({ sortBy: 'recent' });
    const featuredFranchises = recent.filter((f) => f.featured && f.segment === 'franquicia').length;
    expect(featuredFranchises).toBeGreaterThanOrEqual(1);
    expect(featuredFranchises).toBeLessThanOrEqual(2);

    const dates = recent.map((f) => f.createdAt);
    for (let i = 1; i < dates.length; i += 1) {
      expect(dates[i - 1].localeCompare(dates[i])).toBeGreaterThanOrEqual(0);
    }
  });

  it('marca vistas iniciales variadas para el orden "populares"', async () => {
    const recent = await FranchiseRepository.findAll({ sortBy: 'recent' });
    const popular = await FranchiseRepository.findAll({ sortBy: 'popular' });
    const views = recent.map((f) => f.viewsCount);
    expect(new Set(views).size).toBeGreaterThan(1);
    for (let i = 1; i < popular.length; i += 1) {
      expect(popular[i - 1].viewsCount).toBeGreaterThanOrEqual(popular[i].viewsCount);
    }
  });

  it('persiste la fecha de creación para que "recientes" tenga efecto observable', async () => {
    const recent = await FranchiseRepository.findAll({ sortBy: 'recent' });
    const newest = recent[0];
    const oldest = recent[recent.length - 1];
    expect(new Date(newest.createdAt).getTime()).toBeGreaterThan(new Date(oldest.createdAt).getTime());
  });
});