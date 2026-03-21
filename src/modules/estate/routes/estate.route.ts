import { Router, Request as ExpressRequest, Response } from 'express';
import estateController from '../controllers/estate.controller';
import { authenticateToken, requireManager, requireAdmin } from '../../auth/middleware/auth.middleware';
import { verifyUser } from '../../../shared/middleware/verify-user.middleware';
import estateInvitationService from '../services/estate-invitation.service';
import { asString } from '../../../shared/utils/param.util';
import { User } from '../../auth/models/user.model';

const estateRouter = Router();

const getManagerEstateId = async (userId?: string): Promise<string | null> => {
  if (!userId) return null;
  const manager = await User.findByPk(userId, { attributes: ['estate_id'] });
  return manager?.estate_id || null;
};

// Health check endpoint
estateRouter.get('/health', (req: ExpressRequest, res: Response) => {
  res.status(200).json({ message: "Healthy!" });
});

// Estate routes - Requires authentication and verification
// Managers (and above) can create estates
estateRouter.post('/register',
  authenticateToken,
  requireManager,
  verifyUser,
  async (req: ExpressRequest, res: Response) => {
    await estateController.createEstate(req, res);
  }
);

estateRouter.get('/estates', async (req: ExpressRequest, res: Response) => {
  await estateController.getAllEstates(req, res);
});

estateRouter.get('/estates/pending', 
  authenticateToken,
  requireAdmin,
  async (req: ExpressRequest, res: Response) => {
    await estateController.getPendingEstates(req, res);
  }
);

estateRouter.patch('/estates/:estateId/approve', 
  authenticateToken,
  requireAdmin,
  async (req: ExpressRequest, res: Response) => {
    await estateController.approveEstate(req, res);
  }
);

estateRouter.get('/one/:estateId', async (req: ExpressRequest, res: Response) => {
  await estateController.getEstateById(req, res);
});

estateRouter.get('/code/:estate_code', async (req: ExpressRequest, res: Response) => {
  await estateController.getEstateByCode(req, res);
});

estateRouter.post('/invite/:estateId', 
  authenticateToken,
  requireManager,
  async (req: ExpressRequest, res: Response) => {
    try {
      const estateId = asString(req.params.estateId);
      const result = await estateInvitationService.generateInvitationLink(estateId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to generate invitation link' });
    }
  }
);

estateRouter.post('/validate-invite', 
  async (req: ExpressRequest, res: Response) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ valid: false, message: 'Token is required' });
      }
      const result = await estateInvitationService.validateInvitationToken(token);
      res.json(result);
    } catch (error) {
      res.status(500).json({ valid: false, message: 'Failed to validate invitation' });
    }
  }
);

estateRouter.post('/residents/bulk-invite',
  authenticateToken,
  requireManager,
  async (req: ExpressRequest, res: Response) => {
    try {
      const { emails } = req.body as { emails?: string[] };
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ success: false, message: 'emails must be a non-empty array' });
      }

      const managerEstateId = await getManagerEstateId((req as any).user?.id);
      if (!managerEstateId) {
        return res.status(403).json({ success: false, message: 'Manager is not linked to an estate' });
      }

      const inviterName = (req as any).user?.email || 'Estate Manager';
      const result = await estateInvitationService.sendInvitationEmails(managerEstateId, emails, inviterName);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to send invitations' });
    }
  }
);

estateRouter.post('/residents/resend-invite',
  authenticateToken,
  requireManager,
  async (req: ExpressRequest, res: Response) => {
    try {
      const { email } = req.body as { email?: string };
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'email is required' });
      }

      const managerEstateId = await getManagerEstateId((req as any).user?.id);
      if (!managerEstateId) {
        return res.status(403).json({ success: false, message: 'Manager is not linked to an estate' });
      }

      const inviterName = (req as any).user?.email || 'Estate Manager';
      const result = await estateInvitationService.sendInvitationEmails(
        managerEstateId,
        [email.trim().toLowerCase()],
        inviterName
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to resend invitation' });
    }
  }
);

estateRouter.get('/search/:estate_code', async (req: ExpressRequest, res: Response) => {
  await estateController.searchEstate(req, res);
});

estateRouter.put('/update/:estateId', 
  authenticateToken,
  async (req: ExpressRequest, res: Response) => {
    await estateController.updateEstate(req, res);
  }
);

estateRouter.delete('/delete/:estateId',
  authenticateToken,
  async (req: ExpressRequest, res: Response) => {
    await estateController.deleteEstate(req, res);
  }
);

estateRouter.patch('/:estateId/onboarding-step',
  authenticateToken,
  requireManager,
  async (req: ExpressRequest, res: Response) => {
    await estateController.updateOnboardingStep(req, res);
  }
);

estateRouter.patch('/:estateId/setup-checklist',
  authenticateToken,
  requireManager,
  async (req: ExpressRequest, res: Response) => {
    await estateController.updateSetupChecklist(req, res);
  }
);

export default estateRouter;
