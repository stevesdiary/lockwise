import { Router, Request as ExpressRequest, Response } from 'express';
import estateController from '../controllers/estate.controller';
import { authenticateToken, requireManager, requireAdmin } from '../../auth/middleware/auth.middleware';
import { verifyUser } from '../../../shared/middleware/verify-user.middleware';
import estateInvitationService from '../services/estate-invitation.service';

const estateRouter = Router();

// Health check endpoint
estateRouter.get('/health', (req: ExpressRequest, res: Response) => {
  res.status(200).json({ message: "Healthy!" });
});

// Estate routes - Requires authentication and verification
// Only Master and Admin can create estates
estateRouter.post('/register', 
  authenticateToken,
  requireAdmin,
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
      const { estateId } = req.params;
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

export default estateRouter;
