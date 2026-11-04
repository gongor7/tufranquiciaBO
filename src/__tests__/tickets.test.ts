import { createTestDb } from '../test-utils';
import { UserRepository } from '../database/repositories/user.repository';
import { TicketRepository } from '../database/repositories/ticket.repository';
import { FranchiseRepository } from '../database/repositories/franchise.repository';

describe('T28: tickets y solicitudes (RF-40, RF-42, RF-43)', () => {
  beforeEach(async () => {
    await createTestDb();
  });

  it('crea un ticket con los datos del perfil activo (RF-40)', async () => {
    await UserRepository.register({
      fullName: 'Ana Pérez',
      username: 'anap',
      email: 'ana@ejemplo.bo',
      phone: '+591 70099988',
      acceptedTerms: true,
    });

    const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
    const ticket = await TicketRepository.createFromProfile(franchises[0].id);

    expect(ticket.franchiseId).toBe(franchises[0].id);
    expect(ticket.fullName).toBe('Ana Pérez');
    expect(ticket.email).toBe('ana@ejemplo.bo');
    expect(ticket.phone).toBe('+591 70099988');
    expect(ticket.status).toBe('nuevo');
  });

  it('lista los tickets con el nombre de la oportunidad (RF-42)', async () => {
    await UserRepository.register({
      fullName: 'Ana Pérez',
      username: 'anap',
      email: 'ana@ejemplo.bo',
      phone: '+591 70099988',
      acceptedTerms: true,
    });

    const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
    await TicketRepository.createFromProfile(franchises[0].id);
    await TicketRepository.createFromProfile(franchises[1].id);

    const tickets = await TicketRepository.list();
    expect(tickets).toHaveLength(2);
    expect(tickets[0].franchiseName).toBeTruthy();
    expect(tickets.every((t) => t.status === 'nuevo')).toBe(true);
  });

  it('cuenta tickets por estado y permite atender (RF-42)', async () => {
    const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
    const t1 = await TicketRepository.createFromProfile(franchises[0].id);
    await TicketRepository.createFromProfile(franchises[1].id);

    expect(await TicketRepository.countByStatus('nuevo')).toBe(2);
    expect(await TicketRepository.countByStatus('atendido')).toBe(0);

    await TicketRepository.markAttended(t1.id);
    expect(await TicketRepository.countByStatus('nuevo')).toBe(1);
    expect(await TicketRepository.countByStatus('atendido')).toBe(1);
  });

  it('incrementa inquiries_count de la oportunidad al solicitar (trazabilidad)', async () => {
    const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
    const before = franchises[0].inquiriesCount;
    await TicketRepository.createFromProfile(franchises[0].id);
    const after = await FranchiseRepository.findById(franchises[0].id);
    expect(after?.inquiriesCount).toBe(before + 1);
  });
});
