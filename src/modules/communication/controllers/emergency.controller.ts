import { Request, Response } from 'express';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';
import emergencyService from '../services/emergency.service';
import emergencyNotificationService from '../services/emergency.notification.service';
import defaultEmergencyContactsService from '../services/default.emergency.contacts.service';
import { asString } from '../../../shared/utils/param.util';
import locationEmergencyService from '../services/location-emergency.service';
import { Estate } from '../../estate/models/estate.model';

class EmergencyController {
  async createAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const estateId = req.user?.estate_id;
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
      const estateId = req.user?.estate_id;
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
      const alertId = asString(req.params.alertId);

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
      const estateId = req.user?.estate_id;
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
      const estateId = req.user?.estate_id;

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
      const estateId = req.user?.estate_id;
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
      const estateId = req.user?.estate_id;

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

  async getLocationContacts(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { estate_id, country_id, state_id, city_id } = req.query as any;

      let countryId = country_id as string | undefined;
      let stateId = (state_id as string) || null;
      let cityId = (city_id as string) || null;

      if (estate_id) {
        const estate = await Estate.findByPk(estate_id as string, {
          attributes: ['country_id', 'state_id', 'city_id'],
        });
        if (!estate) {
          return res.status(404).json({ success: false, message: 'Estate not found' });
        }
        countryId = (estate as any).country_id;
        stateId = (estate as any).state_id || null;
        cityId = (estate as any).city_id || null;
      }

      if (!countryId && user.estate_id) {
        const estate = await Estate.findByPk(user.estate_id, { attributes: ['country_id'] });
        countryId = (estate as any)?.country_id;
      }

      if (!countryId) {
        return res.status(400).json({ success: false, message: 'Could not determine location' });
      }

      const contacts = await locationEmergencyService.getContactsForLocation({
        countryId,
        stateId,
        cityId,
      });

      return res.status(200).json({ success: true, data: contacts });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getCountries(req: Request, res: Response) {
    try {
      const data = await locationEmergencyService.getCountries();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getStates(req: Request, res: Response) {
    try {
      const countryId = req.params.countryId as string;
      const data = await locationEmergencyService.getStates(countryId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getCities(req: Request, res: Response) {
    try {
      const stateId = req.params.stateId as string;
      const data = await locationEmergencyService.getCities(stateId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const data = await locationEmergencyService.getCategories();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async adminListContacts(req: Request, res: Response) {
    try {
      const { country_id, state_id, category_id } = req.query as any;
      const data = await locationEmergencyService.getAllContacts({
        countryId: country_id,
        stateId: state_id,
        categoryId: category_id,
      });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async adminCreateContact(req: Request, res: Response) {
    try {
      const { category_id, name, phone_number, alt_phone_number, country_id, state_id, city_id, description, priority } = req.body;
      if (!category_id || !name || !phone_number || !country_id) {
        return res.status(400).json({ success: false, message: 'category_id, name, phone_number, country_id are required' });
      }
      const contact = await locationEmergencyService.createContact({
        category_id, name, phone_number, alt_phone_number, country_id, state_id, city_id, description, priority,
      });
      return res.status(201).json({ success: true, data: contact });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async adminUpdateContact(req: Request, res: Response) {
    try {
      const contactId = req.params.contactId as string;
      const updated = await locationEmergencyService.updateContact(contactId, req.body);
      if (!updated) return res.status(404).json({ success: false, message: 'Contact not found' });
      return res.status(200).json({ success: true, message: 'Contact updated' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async adminDeleteContact(req: Request, res: Response) {
    try {
      const contactId = req.params.contactId as string;
      const deleted = await locationEmergencyService.deleteContact(contactId);
      if (!deleted) return res.status(404).json({ success: false, message: 'Contact not found' });
      return res.status(200).json({ success: true, message: 'Contact deleted' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new EmergencyController();