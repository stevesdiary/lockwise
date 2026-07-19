import { nfcRepository } from '../../access/repositories/nfc.repository';
import pushNotificationService from '../../communication/services/push.notification.service';

export const nfcService = {
  async validateAccess(cardUID: string, accessPoint: string, accessType: 'entry' | 'exit') {
    const card = await nfcRepository.findCardByUID(cardUID);

    if (!card) {
      await nfcRepository.createAccessLog({
        card_uid: cardUID,
        access_point: accessPoint,
        access_type: accessType,
        status: 'denied',
        denial_reason: 'Card not found'
      });
      return { granted: false, reason: 'Card not found' };
    }

    // Check card status
    if (card.status !== 'active') {
      await nfcRepository.createAccessLog({
        card_id: card.id,
        card_uid: cardUID,
        user_id: card.user_id,
        access_point: accessPoint,
        access_type: accessType,
        status: 'denied',
        denial_reason: `Card ${card.status}`
      });
      return { granted: false, reason: `Card ${card.status}` };
    }

    // Check expiry
    if (card.expiry_date && new Date(card.expiry_date) < new Date()) {
      await nfcRepository.createAccessLog({
        card_id: card.id,
        card_uid: cardUID,
        user_id: card.user_id,
        access_point: accessPoint,
        access_type: accessType,
        status: 'denied',
        denial_reason: 'Card expired'
      });
      return { granted: false, reason: 'Card expired' };
    }

    // Grant access
    await nfcRepository.createAccessLog({
      card_id: card.id,
      card_uid: cardUID,
      user_id: card.user_id,
      access_point: accessPoint,
      access_type: accessType,
      status: 'granted'
    });

    await nfcRepository.updateLastUsed(card.id);

    return { granted: true, card, user: card.user };
  },

  async getMyCard(userId: string) {
    return await nfcRepository.findUserCard(userId);
  },

  async getMyAccessHistory(userId: string) {
    return await nfcRepository.findUserAccessLogs(userId);
  },

  async reportLost(userId: string) {
    const card = await nfcRepository.findUserCard(userId);
    if (!card) throw new Error('Card not found');

    await nfcRepository.updateCardStatus(card.id, 'lost');
    await pushNotificationService.sendToUser(userId, 'Card Reported Lost', 'Your NFC card has been deactivated', { type: 'nfc_card', card_id: card.id });

    return card;
  }
};
