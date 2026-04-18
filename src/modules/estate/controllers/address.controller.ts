import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Street } from '../models/street.model';
import { Unit } from '../models/unit.model';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';

class AddressController {
  async getStreets(req: Request, res: Response) {
    try {
      const estateId = Array.isArray(req.params.estate_id) ? req.params.estate_id[0] : req.params.estate_id;
      const { search } = req.query;

      const where: any = { estate_id: estateId };
      if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
      }

      const streets = await Street.findAll({ where, order: [['name', 'ASC']] });

      return res.json({ status: 'success', data: streets });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getUnits(req: Request, res: Response) {
    try {
      const streetId = Array.isArray(req.params.street_id) ? req.params.street_id[0] : req.params.street_id;

      const units = await Unit.findAll({
        where: { street_id: streetId },
        include: [{ model: Street, as: 'street' }],
        order: [['unit_identifier', 'ASC']],
      });

      return res.json({ status: 'success', data: units });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  // Search units across all streets of an estate
  async searchUnits(req: Request, res: Response) {
    try {
      const estateId = Array.isArray(req.params.estate_id) ? req.params.estate_id[0] : req.params.estate_id;
      const { search, street_id } = req.query;

      const streetWhere: any = { estate_id: estateId };
      if (street_id) streetWhere.street_id = street_id;

      const unitWhere: any = {};
      if (search) {
        unitWhere[Op.or] = [
          { unit_identifier: { [Op.iLike]: `%${search}%` } },
          { block: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const units = await Unit.findAll({
        where: unitWhere,
        include: [{
          model: Street,
          as: 'street',
          where: streetWhere,
          attributes: ['street_id', 'name'],
        }],
        order: [['unit_identifier', 'ASC']],
      });

      return res.json({ status: 'success', data: units });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async createStreet(req: Request, res: Response) {
    try {
      const estateId = Array.isArray(req.params.estate_id) ? req.params.estate_id[0] : req.params.estate_id;
      const { name } = req.body;

      const street = await Street.create({ estate_id: estateId, name });

      return res.status(201).json({ status: 'success', data: street });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async createUnit(req: Request, res: Response) {
    try {
      const streetId = Array.isArray(req.params.street_id) ? req.params.street_id[0] : req.params.street_id;
      const { unit_identifier, block, floor, unit_type, unit_details } = req.body;

      const unit = await Unit.create({ street_id: streetId, unit_identifier, block, floor, unit_type, unit_details });

      return res.status(201).json({ status: 'success', data: unit });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getFullAddress(req: Request, res: Response) {
    try {
      const unitId = Array.isArray(req.params.unit_id) ? req.params.unit_id[0] : req.params.unit_id;

      const unit = await Unit.findByPk(unitId, {
        include: [{
          model: Street,
          as: 'street',
          include: [{ model: require('../models/estate.model').Estate }],
        }],
      });

      if (!unit) {
        return res.status(404).json({ status: 'error', message: 'Unit not found' });
      }

      const fullAddress = `${unit.unit_identifier}, ${unit.street.name}, ${(unit.street as any).estate.name}`;

      return res.json({ status: 'success', data: { unit, fullAddress } });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new AddressController();
