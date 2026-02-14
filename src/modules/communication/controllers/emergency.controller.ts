import { Request, Response } from 'express';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';
import emergencyService from '../services/emergency.service';
import emergencyNotificationService from '../services/emergency.notification.service';
import defaultEmergencyContactsService from '../services/default.emergency.contacts.service';

class EmergencyController {
  async createAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const estateId = req.user?.estateId;
      const { type, description, location } = req.body;

      if (!userId || !estateId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const alert = await emergencyService.createAlert({
        estate_id: estateId,
        user_id: userId,
        type,
        description,
        location
      });

      // Send real-time notifications
      await emergencyNotificationService.broadcastEmergencyAlert(alert);

      return res.status(201).json({
        status: 'success',
        data: alert
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getAlerts(req: Request, res: Response) {
    try {
      const estateId = req.user?.estateId;
      const { status } = req.query;

      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const alerts = await emergencyService.getEstateAlerts(estateId, status as string);

      return res.status(200).json({
        status: 'success',
        data: alerts
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async resolveAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { alertId } = req.params;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const resolved = await emergencyService.resolveAlert(alertId, userId);

      if (!resolved) {
        return res.status(404).json({
          status: 'fail',
          message: 'Alert not found'
        });
      }

      // Send status update notification
      const estateId = req.user?.estateId;
      if (estateId) {
        await emergencyNotificationService.sendAlertUpdate(alertId, estateId, 'resolved');
      }

      return res.status(200).json({
        status: 'success',
        message: 'Alert resolved successfully'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getEmergencyContacts(req: Request, res: Response) {
    try {
      const estateId = req.user?.estateId;

      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const contacts = await emergencyService.getEmergencyContacts(estateId);

      return res.status(200).json({
        status: 'success',
        data: contacts
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async createEmergencyContact(req: Request, res: Response) {
    try {
      const estateId = req.user?.estateId;
      const { name, type, phone, email, address } = req.body;

      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const contact = await emergencyService.createEmergencyContact({
        estate_id: estateId,
        name,
        type,
        phone,
        email,
        address
      });

      return res.status(201).json({
        status: 'success',
        data: contact
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async setupDefaultContacts(req: Request, res: Response) {
    try {
      const estateId = req.user?.estateId;

      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const contactsCreated = await defaultEmergencyContactsService.createDefaultContacts(estateId);

      return res.status(200).json({
        status: 'success',
        message: `${contactsCreated} default emergency contacts created`
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new EmergencyController();