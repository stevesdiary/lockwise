import { NFCCard } from '../../access/models/nfc-card.model';
import { NFCAccessLog } from '../../access/models/nfc-access-log.model';
import { User } from '../../auth';

export const nfcRepository = {
  async findCardByUID(cardUID: string) {
    return await NFCCard.findOne({
      where: { card_uid: cardUID },
      include: [User]
    });
  },

  async findUserCard(userId: string) {
    return await NFCCard.findOne({
      where: { user_id: userId },
      include: [User]
    });
  },

  async createCard(data: any) {
    return await NFCCard.create(data);
  },

  async updateCardStatus(cardId: string, status: string) {
    const card = await NFCCard.findByPk(cardId);
    if (!card) return null;
    return await card.update({ status });
  },

  async updateLastUsed(cardId: string) {
    const card = await NFCCard.findByPk(cardId);
    if (!card) return null;
    return await card.update({ last_used: new Date() });
  },

  async createAccessLog(data: any) {
    return await NFCAccessLog.create(data);
  },

  async findUserAccessLogs(userId: string, limit: number = 50) {
    return await NFCAccessLog.findAll({
      where: { user_id: userId },
      order: [['timestamp', 'DESC']],
      limit
    });
  }
};
