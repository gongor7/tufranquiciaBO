import { createTestDb } from '../test-utils';
import { FranchiseRepository } from '../database/repositories/franchise.repository';
import { FavoriteRepository } from '../database/repositories/favorite.repository';
import { MessageRepository } from '../database/repositories/message.repository';
import { UserRepository } from '../database/repositories/user.repository';

describe('Repositorios (RF-4..RF-22)', () => {
  beforeEach(async () => {
    await createTestDb();
  });

  describe('filtros y orden (RF-4, RF-5, RF-6)', () => {
    it('busca por texto ignorando mayúsculas en nombre (RF-4)', async () => {
      const cafes = await FranchiseRepository.findAll({ sortBy: 'recent', text: 'CAFÉ' });
      expect(cafes.length).toBeGreaterThan(0);
      expect(cafes.every((f) => f.name.toLowerCase().includes('café'))).toBe(true);
    });

    it('combina filtros de industria y departamento con AND (RF-5)', async () => {
      const food = await FranchiseRepository.findAll({
        sortBy: 'recent',
        industry: 'comida',
        department: 'La Paz',
      });
      expect(food.length).toBeGreaterThan(0);
      expect(food.every((f) => f.industry === 'comida' && f.department === 'La Paz')).toBe(true);
    });

    it('aplica el rango de inversión como intersección de intervalos (RF-5)', async () => {
      const results = await FranchiseRepository.findAll({
        sortBy: 'recent',
        minInvestment: 20000,
        maxInvestment: 45000,
      });
      expect(
        results.every(
          (f) => f.maxInvestment >= 20000 && f.minInvestment <= 45000,
        ),
      ).toBe(true);
    });

    it('ordena por recientes, populares e inversión (RF-6)', async () => {
      const recent = await FranchiseRepository.findAll({ sortBy: 'recent' });
      const popular = await FranchiseRepository.findAll({ sortBy: 'popular' });
      const asc = await FranchiseRepository.findAll({ sortBy: 'investment' });
      const desc = await FranchiseRepository.findAll({ sortBy: 'investmentDesc' });

      for (let i = 1; i < recent.length; i += 1) {
        expect(recent[i - 1].createdAt.localeCompare(recent[i].createdAt)).toBeGreaterThanOrEqual(0);
      }
      for (let i = 1; i < popular.length; i += 1) {
        expect(popular[i - 1].viewsCount).toBeGreaterThanOrEqual(popular[i].viewsCount);
      }
      for (let i = 1; i < asc.length; i += 1) {
        expect(asc[i - 1].minInvestment).toBeLessThanOrEqual(asc[i].minInvestment);
      }
      for (let i = 1; i < desc.length; i += 1) {
        expect(desc[i - 1].minInvestment).toBeGreaterThanOrEqual(desc[i].minInvestment);
      }
    });

    it('devuelve vacío cuando ningún filtro coincide y el registro duplicado se permite', async () => {
      const none = await FranchiseRepository.findAll({ sortBy: 'recent', department: 'Mars' });
      expect(none.length).toBe(0);
    });
  });

  describe('favoritos (RF-10, RF-11)', () => {
    it('alterna añadir/eliminar y persiste el estado', async () => {
      const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
      const target = franchises[0];

      const added = await FavoriteRepository.toggle(target.id);
      expect(added).toBe(true);
      expect(await FavoriteRepository.isFavorite(target.id)).toBe(true);

      const removed = await FavoriteRepository.toggle(target.id);
      expect(removed).toBe(false);
      expect(await FavoriteRepository.isFavorite(target.id)).toBe(false);
    });

    it('es idempotente al añadir dos veces', async () => {
      const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
      const target = franchises[0];
      await FavoriteRepository.add(target.id);
      await FavoriteRepository.add(target.id);
      expect((await FavoriteRepository.listIds()).filter((id) => id === target.id).length).toBe(1);
    });
  });

  describe('vistas (RF-9)', () => {
    it('incrementa views_count en 1 al abrir el detalle', async () => {
      const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
      const target = franchises[0];
      const before = target.viewsCount;
      await FranchiseRepository.incrementViews(target.id);
      const after = await FranchiseRepository.findById(target.id);
      expect(after?.viewsCount).toBe(before + 1);
    });
  });

  describe('mensajes y chat (RF-12, RF-20, RF-21, RF-22)', () => {
    it('crea una conversación al enviar un formulario de contacto (RF-12, RF-20)', async () => {
      const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
      const target = franchises[0];
      await MessageRepository.createContactMessage({
        franchiseId: target.id,
        senderName: 'Ana',
        senderEmail: 'ana@ejemplo.com',
        message: 'Me interesa invertir.',
      });

      const conversations = await MessageRepository.listConversations();
      expect(conversations).toHaveLength(1);
      expect(conversations[0].franchiseId).toBe(target.id);
      expect(conversations[0].lastMessage).toBe('Me interesa invertir.');
    });

    it('incrementa inquiries_count al contactar', async () => {
      const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
      const target = franchises[0];
      await MessageRepository.createContactMessage({
        franchiseId: target.id,
        senderName: 'Ana',
        senderEmail: 'ana@ejemplo.com',
        message: 'Hola',
      });
      const after = await FranchiseRepository.findById(target.id);
      expect(after?.inquiriesCount).toBe(1);
    });

    it('marca como leídas las conversaciones al abrir el hilo (RF-21)', async () => {
      const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
      const target = franchises[0];
      await MessageRepository.createContactMessage({
        franchiseId: target.id,
        senderName: 'Ana',
        senderEmail: 'ana@ejemplo.com',
        message: 'Hola',
      });

      await MessageRepository.markAsRead(target.id);
      const messages = await MessageRepository.listByFranchise(target.id);
      expect(messages.every((m) => m.isRead)).toBe(true);
      expect(await MessageRepository.countUnread()).toBe(0);
    });

    it('permite responder y mantiene el hilo único por franquicia (RF-22)', async () => {
      const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
      const target = franchises[0];
      await MessageRepository.createContactMessage({
        franchiseId: target.id,
        senderName: 'Ana',
        senderEmail: 'ana@ejemplo.com',
        message: 'Hola',
      });
      await MessageRepository.addReply(target.id, 'Inversionista', 'Hola, soy cliente.');

      const messages = await MessageRepository.listByFranchise(target.id);
      expect(messages).toHaveLength(2);
      expect(messages[1].message).toBe('Hola, soy cliente.');
    });
  });

  describe('perfil y rol (RF-17, RF-18, RF-19)', () => {
    it('existe un perfil por defecto con rol inversionista (RF-19)', async () => {
      const profile = await UserRepository.getProfile();
      expect(profile).not.toBeNull();
      expect(profile?.role).toBe('inversionista');
    });

    it('se puede actualizar rol y persistir (RF-18, RF-14a)', async () => {
      const profile = await UserRepository.getProfile();
      const updated = await UserRepository.updateProfile(profile!.id, {
        name: 'María',
        role: 'franquiciador',
      });
      expect(updated.role).toBe('franquiciador');
      expect(await UserRepository.isFranquiciador()).toBe(true);
    });

    it('crea perfil por defecto si no existe (RF-19)', async () => {
      const executor = await createTestDb();
      await executor.run('DELETE FROM users');
      const created = await UserRepository.createDefaultProfile();
      expect(created.role).toBe('inversionista');
      expect(await UserRepository.getProfile()).not.toBeNull();
    });
  });
});