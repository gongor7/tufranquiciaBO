import { createTestDb } from '../test-utils';
import { FranchiseRepository } from '../database/repositories/franchise.repository';

describe('T18: repositorio de oportunidades por segmento', () => {
  beforeEach(async () => {
    await createTestDb();
  });

  it('filtra por un segmento (RF-29)', async () => {
    const sociedades = await FranchiseRepository.findAll({
      segments: ['sociedad'],
      sortBy: 'recent',
    });
    expect(sociedades).toHaveLength(4);
    expect(sociedades.every((s) => s.segment === 'sociedad')).toBe(true);
  });

  it('filtra por varios segmentos combinados (RF-29)', async () => {
    const rows = await FranchiseRepository.findAll({
      segments: ['sociedad', 'mipe'],
      sortBy: 'recent',
    });
    expect(rows).toHaveLength(6);
    expect(rows.every((r) => r.segment === 'sociedad' || r.segment === 'mipe')).toBe(true);
  });

  it('combina segmento con industria y departamento (RF-29)', async () => {
    const rows = await FranchiseRepository.findAll({
      segments: ['mipe'],
      department: 'La Paz',
      sortBy: 'recent',
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Quesería Alto Beni');
  });

  it('aplica el rango de inversión sobre el monto buscado en sociedades (RF-29, RF-33)', async () => {
    const rows = await FranchiseRepository.findAll({
      segments: ['sociedad'],
      minInvestment: 100000,
      maxInvestment: 130000,
      sortBy: 'recent',
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Textilera del Oriente SA');
  });

  it('lista sociedades sin monto cuando no hay filtro de inversión (RF-33)', async () => {
    const executor = await createTestDb();
    await executor.run(
      `INSERT INTO franchises (
        name, slug, description, industry, department, city, min_investment,
        max_investment, contact_name, contact_email, status, created_at, updated_at,
        segment, subtype, sought_amount
      ) VALUES ('SRL Sin Monto', 'srl-sin-monto', 'desc', 'salud', 'Santa Cruz',
        'Santa Cruz de la Sierra', 0, 0, 'C', 'c@c.bo', 'activa',
        datetime('now'), datetime('now'), 'sociedad', 'srl', NULL);`,
    );

    const todas = await FranchiseRepository.findAll({ segments: ['sociedad'], sortBy: 'recent' });
    expect(todas).toHaveLength(5);

    const conFiltro = await FranchiseRepository.findAll({
      segments: ['sociedad'],
      minInvestment: 1,
      sortBy: 'recent',
    });
    expect(conFiltro.some((r) => r.name === 'SRL Sin Monto')).toBe(false);
  });

  it('excluye proyectos vencidos de los listados activos (RF-34)', async () => {
    const sinFiltro = await FranchiseRepository.findAll({ sortBy: 'recent' });
    expect(sinFiltro.some((r) => r.name === 'Proyecto Carnaval de Oruro 2026')).toBe(false);
    expect(sinFiltro.some((r) => r.name === 'Proyecto Fexpocruz Gastronómico')).toBe(true);
  });

  it('incluye el proyecto vencido al filtrar por su segmento (RF-34)', async () => {
    const proyectos = await FranchiseRepository.findAll({
      segments: ['proyecto'],
      sortBy: 'recent',
    });
    expect(proyectos).toHaveLength(2);
  });

  it('crea una sociedad con validación de dominio y persiste sus campos (RF-36)', async () => {
    const creada = await FranchiseRepository.create({
      segment: 'sociedad',
      subtype: 'srl',
      name: 'Logística Illimani SRL',
      description: 'Operador logístico',
      industry: 'distribución',
      department: 'La Paz',
      city: 'La Paz',
      soughtAmount: 90000,
      availablePercentage: 40,
      contactName: 'Test',
      contactEmail: 't@t.bo',
      minInvestment: 90000,
      maxInvestment: 90000,
    } as never);

    expect(creada.segment).toBe('sociedad');
    expect(creada.soughtAmount).toBe(90000);
    expect(creada.availablePercentage).toBe(40);

    const releida = await FranchiseRepository.findById(creada.id);
    expect(releida?.subtype).toBe('srl');
    expect(releida?.soughtAmount).toBe(90000);
  });

  it('lista los hitos de un MIPE del seed (RF-36)', async () => {
    const mipes = await FranchiseRepository.findAll({ segments: ['mipe'], sortBy: 'recent' });
    const hitos = await FranchiseRepository.getMilestones(mipes[0].id);
    expect(hitos.length).toBeGreaterThanOrEqual(3);
    expect(hitos[0].position).toBe(0);
    expect(hitos.every((h) => h.title.length > 0)).toBe(true);
  });
});
