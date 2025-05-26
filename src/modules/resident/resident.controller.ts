import { Request as ExpressRequest, Response } from "express";
// import { getAllResidents, getOneResident, updateResident } from "../repositories/resident.repository";
import { ResidentService } from "./resident.service";

const residentService = new ResidentService();


const ResidentController = {
  create: async (req: ExpressRequest, res: Response): Promise<Response> => {
    try {
      const createResidentData = req.body;
      const estateId = req.query.estate_id as string;
      if (!createResidentData || !estateId) {
        return res.status(400).json({
          status: "error",
          message: "Estate ID and resident data are required",
        });
      }
      const residentData = {
        ...createResidentData,
        estate_id: estateId
      };
      const newResident = await residentService.createResident(residentData);
      return res.json(newResident);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create resident",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },

  getAllByEstate: async (req: ExpressRequest, res: Response): Promise<Response> => {
    try {
      const estateId = req.query.estate_id as string;
      const residents = await residentService.getResidentsByEstate(estateId);
      return res.json( residents);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve residents",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },

  getOne: async (req: ExpressRequest, res: Response): Promise<Response> => {
    try {
      const residentId = req.params.id;
      const estateId = req.query.estate_id as string;
      if (!residentId || !estateId) {
        return res.status(400).json({
          status: "error",
          message: "Resident ID and Estate ID are required",
        });
      }
      const resident = await residentService.getOneResident(residentId, estateId);
      if (!resident) {
        return res.status(404).json({
          status: "error",
          message: "Resident not found",
        });
      }
      return res.status(200).json({
        status: "success",
        data: resident,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve resident",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },

  update: async (req: ExpressRequest, res: Response): Promise<Response> => {
    try {
      const residentId = req.params.id;
      const updatedData = req.body;
      
      const updatedResident = await residentService.updateResident(residentId, updatedData);
      if (!updatedResident) {
        return res.status(404).json({
          status: "error",
          message: "Resident not found",
        });
      }
    return res.json( updatedResident );
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to update resident",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
}
