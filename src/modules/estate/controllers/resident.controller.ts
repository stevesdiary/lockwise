import { Request, Response } from 'express';
import { Resident } from '../models/resident.model';
import { Unit } from '../models/unit.model';
import { Street } from '../models/street.model';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';

class ResidentController {
  // Update resident address by selecting unit
  async updateResidentAddress(req: Request, res: Response) {
    try {
      const { resident_id } = req.params;
      const { unit_id } = req.body;

      // Get unit with street info to build full address
      const unit = await Unit.findByPk(unit_id, {
        include: [{ model: Street, as: 'street' }]
      });

      if (!unit) {
        return res.status(404).json({
          status: 'error',
          message: 'Unit not found'
        });
      }

      // Build full address
      const fullAddress = `${unit.unit_identifier}, ${unit.street.name}`;

      // Update resident
      const resident = await Resident.update(
        {
          unit_id,
          address: fullAddress
        },
        {
          where: { resident_id },
          returning: true
        }
      );

      return res.json({
        status: 'success',
        message: 'Address updated successfully',
        data: {
          resident: resident[1][0],
          fullAddress
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  // Get resident with full address details
  async getResidentWithAddress(req: Request, res: Response) {
    try {
      const { resident_id } = req.params;

      const resident = await Resident.findByPk(Array.isArray(resident_id) ? resident_id[0] : resident_id, {
        include: [{
          model: Unit,
          as: 'unit',
          include: [{ model: Street, as: 'street' }]
        }]
      });

      if (!resident) {
        return res.status(404).json({
          status: 'error',
          message: 'Resident not found'
        });
      }

      return res.json({
        status: 'success',
        data: resident
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new ResidentController();