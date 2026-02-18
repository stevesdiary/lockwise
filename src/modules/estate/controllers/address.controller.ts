import { Request, Response } from 'express';
import { Street } from '../models/street.model';
import { Unit } from '../models/unit.model';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';

class AddressController {
  // Get streets for an estate with search
  async getStreets(req: Request, res: Response) {
    try {
      const { estate_id } = req.params;
      const estateId = Array.isArray(estate_id) ? estate_id[0] : estate_id;
      const { search } = req.query;

      const whereClause: any = { estate_id: estateId };
      if (search) {
        whereClause.name = { [require('sequelize').Op.iLike]: `%${search}%` };
      }

      const streets = await Street.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
      });

      return res.json({
        status: 'success',
        data: streets
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  // Get units for a street
  async getUnits(req: Request, res: Response) {
    try {
      const { street_id } = req.params;
      const streetId = Array.isArray(street_id) ? street_id[0] : street_id;

      const units = await Unit.findAll({
        where: { street_id: streetId },
        include: [{ model: Street, as: 'street' }],
        order: [['unit_identifier', 'ASC']]
      });

      return res.json({
        status: 'success',
        data: units
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  // Create street for estate
  async createStreet(req: Request, res: Response) {
    try {
      const { estate_id } = req.params;
      const estateId = Array.isArray(estate_id) ? estate_id[0] : estate_id;
      const { name } = req.body;

      const street = await Street.create({
        estate_id: estateId,
        name
      });

      return res.status(201).json({
        status: 'success',
        data: street
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  // Create unit for street
  async createUnit(req: Request, res: Response) {
    try {
      const { street_id } = req.params;
      const streetId = Array.isArray(street_id) ? street_id[0] : street_id;
      const { unit_identifier, block, floor, unit_type, unit_details } = req.body;

      const unit = await Unit.create({
        street_id: streetId,
        unit_identifier,
        block,
        floor,
        unit_type,
        unit_details
      });

      return res.status(201).json({
        status: 'success',
        data: unit
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  // Get full address for a unit
  async getFullAddress(req: Request, res: Response) {
    try {
      const { unit_id } = req.params;
      const unitId = Array.isArray(unit_id) ? unit_id[0] : unit_id;

      const unit = await Unit.findByPk(unitId, {
        include: [{
          model: Street,
          as: 'street',
          include: [{ model: require('../models/estate.model').Estate }]
        }]
      });

      if (!unit) {
        return res.status(404).json({
          status: 'error',
          message: 'Unit not found'
        });
      }

      const fullAddress = `${unit.unit_identifier}, ${unit.street.name}, ${(unit.street as any).estate.name}`;

      return res.json({
        status: 'success',
        data: {
          unit,
          fullAddress
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new AddressController();