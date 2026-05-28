import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import billsService from '../services/bills.service';
import { ElectricityProvider, ELECTRICITY_PROVIDERS } from '../types/vtpass.types';

const router = Router();

// Map mobile disco codes to VTpass serviceIDs
const DISCO_MAP: Record<string, ElectricityProvider> = {
  'ikeja': 'ikeja-electric',
  'eko': 'eko-electric',
  'kano': 'kano-electric',
  'portharcourt': 'portharcourt-electric',
  'jos': 'jos-electric',
  'ibadan': 'ibadan-electric',
  'kaduna': 'kaduna-electric',
  'abuja': 'abuja-electric',
  'enugu': 'enugu-electric',
  'benin': 'benin-electric',
  // Also accept full VTpass IDs
  ...Object.fromEntries(Object.keys(ELECTRICITY_PROVIDERS).map(k => [k, k as ElectricityProvider])),
};

function resolveServiceID(disco: string): ElectricityProvider | null {
  return DISCO_MAP[disco] || DISCO_MAP[disco.toLowerCase()] || null;
}

/** POST /electricity/validate-meter */
router.post('/validate-meter', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { meter_number, disco, meter_type } = req.body || {};
    if (!meter_number || !disco || !meter_type) {
      return res.status(400).json({ success: false, error: 'meter_number, disco, and meter_type are required' });
    }

    const serviceID = resolveServiceID(disco);
    if (!serviceID) return res.status(400).json({ success: false, error: 'Invalid disco code' });

    const result = await billsService.verifyMeter(serviceID, meter_number, meter_type);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    const isInvalidMeter = error.message.includes('not correct') || error.message.includes('not a valid') || error.message.includes('Invalid meter');
    return res.status(isInvalidMeter ? 422 : 400).json({
      success: false,
      error: error.message,
      code: isInvalidMeter ? 'INVALID_METER' : 'VERIFICATION_FAILED',
    });
  }
});

/** POST /electricity/vend */
router.post('/vend', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { meter_number, disco, meter_type, amount } = req.body || {};

    if (!meter_number || !disco || !meter_type || !amount) {
      return res.status(400).json({ success: false, error: 'meter_number, disco, meter_type, and amount are required' });
    }

    const serviceID = resolveServiceID(disco);
    if (!serviceID) return res.status(400).json({ success: false, error: 'Invalid disco code' });
    if (amount < 1000) return res.status(400).json({ success: false, error: 'Minimum amount is ₦1,000' });

    const result = await billsService.purchaseElectricity({
      userId: user.id,
      estateId: user.estate_id,
      serviceID,
      meterNumber: meter_number,
      type: meter_type,
      amount,
      phone: user.email, // fallback; mobile doesn't send phone
    });

    return res.json({
      success: true,
      data: {
        reference: result.requestId,
        token: result.token,
        units: null,
        amount: result.amount,
        status: result.status === 'success' ? 'successful' : result.status,
        provider: result.provider,
        meterNumber: meter_number,
        disco: disco.toUpperCase(),
        meterType: meter_type,
        transaction_id: result.transactionId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/** POST /electricity/requery */
router.post('/requery', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { reference } = req.body || {};
    if (!reference) return res.status(400).json({ success: false, error: 'reference is required' });

    const result = await billsService.requeryTransaction(reference, user.id);
    return res.json({
      success: true,
      data: {
        reference: result.requestId,
        token: result.token,
        units: null,
        amount: result.amount,
        status: result.status === 'success' ? 'successful' : result.status,
        provider: result.provider,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

/** GET /electricity/transactions */
router.get('/transactions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const { rows, count } = await billsService.getUserTransactions(user.id, limit, offset);

    // Map to mobile-expected format
    const transactions = rows.map((tx: any) => ({
      id: tx.id,
      meter_number: tx.billers_code,
      disco: serviceIdToDisco(tx.service_id),
      meter_type: tx.variation_code,
      amount: Number(tx.amount),
      token: tx.token,
      units: null,
      status: tx.status === 'success' ? 'successful' : tx.status,
      provider: tx.provider_name,
      request_id: tx.request_id,
      auto_loaded: false,
      created_at: tx.created_at || tx.createdAt,
    }));

    return res.json({ success: true, data: { transactions, total: count } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Map VTpass serviceID back to short disco code for mobile
function serviceIdToDisco(serviceId: string): string {
  const map: Record<string, string> = {
    'ikeja-electric': 'IKEDC',
    'eko-electric': 'EKEDC',
    'kano-electric': 'KEDCO',
    'portharcourt-electric': 'PHED',
    'jos-electric': 'JED',
    'ibadan-electric': 'IBEDC',
    'kaduna-electric': 'KAEDCO',
    'abuja-electric': 'AEDC',
    'enugu-electric': 'EEDC',
    'benin-electric': 'BEDC',
  };
  return map[serviceId] || serviceId;
}

export default router;
