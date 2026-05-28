import { Request, Response } from 'express';
import { kudaService } from '../services/kuda.service';
import { estateWalletService } from '../services/estate-wallet.service';
import { EstateWallet, EstateWalletTransaction } from '../models/estate-wallet.model';
import { Wallet, WalletTransaction } from '../../wallet/models/wallet.model';
import walletService from '../../wallet/services/wallet.service';
import { KudaWebhookPayload } from '../types/kuda.types';

export const kudaWebhookController = {
  async handleWebhook(req: Request, res: Response) {
    // Always respond 200 to prevent Kuda retry storms
    const rawBody: string = (req as any).rawBody || JSON.stringify(req.body);
    const signature = (req.headers['x-kuda-signature'] || req.headers['x-lockwise-kuda-sig'] || '') as string;

    if (!kudaService.verifyWebhookSignature(rawBody, signature)) {
      return res.status(200).json({ received: true });
    }

    const payload: KudaWebhookPayload = req.body;
    const sanitizedCode = (payload.notificationCode || 'unknown').replace(/[\r\n]/g, '');

    try {
      switch (payload.notificationCode) {
        case 'VA_CREDIT':
          await handleVirtualAccountCredit(payload);
          break;
        default:
          console.log('Unhandled Kuda webhook event:', sanitizedCode);
      }
    } catch (error: any) {
      const sanitized = error?.message?.replace(/[\r\n]/g, '') || 'unknown';
      console.error('Kuda webhook processing error:', sanitized);
    }

    return res.status(200).json({ received: true });
  },
};

async function handleVirtualAccountCredit(payload: KudaWebhookPayload) {
  const td = payload.transactionData;
  if (!td?.trackingReference || !td?.amount || !td?.transactionReference) return;

  const { trackingReference, amount, transactionReference, senderName } = td;

  if (trackingReference.startsWith('EW_')) {
    await creditEstateWallet(trackingReference, amount, transactionReference, senderName);
  } else if (trackingReference.startsWith('RW_')) {
    await creditResidentWallet(trackingReference, amount, transactionReference, senderName);
  }
}

async function creditResidentWallet(
  trackingReference: string,
  amount: number,
  transactionReference: string,
  senderName?: string,
) {
  const wallet = await Wallet.findOne({ where: { kuda_tracking_reference: trackingReference } });
  if (!wallet) {
    console.warn('Resident wallet not found for tracking ref:', trackingReference.replace(/[\r\n]/g, ''));
    return;
  }

  const duplicate = await WalletTransaction.findOne({ where: { reference: transactionReference } });
  if (duplicate) return;

  const description = senderName ? `Bank transfer from ${senderName}` : 'Bank transfer credit';
  await walletService.credit(wallet.user_id, amount, description, transactionReference);
}

async function creditEstateWallet(
  trackingReference: string,
  amount: number,
  transactionReference: string,
  senderName?: string,
) {
  const wallet = await EstateWallet.findOne({ where: { kuda_tracking_reference: trackingReference } });
  if (!wallet) {
    console.warn('Estate wallet not found for tracking ref:', trackingReference.replace(/[\r\n]/g, ''));
    return;
  }

  const duplicate = await EstateWalletTransaction.findOne({ where: { reference: transactionReference } });
  if (duplicate) return;

  const description = senderName ? `Bank transfer from ${senderName}` : 'Bank transfer credit';
  await estateWalletService.credit(wallet.estate_id, amount, description, transactionReference);
}
