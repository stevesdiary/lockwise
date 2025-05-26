"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const estate_repository_1 = require("../repositories/estate.repository");
class EstateController {
    constructor() {
        this.estateRepository = new estate_repository_1.EstateRepository();
    }
    createEstate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const estate = yield this.estateRepository.create(req.body);
                return res.status(201).json({
                    status: 'success',
                    message: 'Estate created successfully',
                    data: estate
                });
            }
            catch (error) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Failed to create estate',
                    error: error
                });
            }
        });
    }
    getAllEstates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const estates = yield this.estateRepository.findAll();
                return res.status(200).json({
                    status: 'success',
                    message: 'Estates retrieved successfully',
                    data: estates
                });
            }
            catch (error) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to retrieve estates',
                    error: error
                });
            }
        });
    }
    getEstateById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const estate = yield this.estateRepository.findById(req.params.estateId);
                if (!estate) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'Estate not found'
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    message: 'Estate retrieved successfully',
                    data: estate
                });
            }
            catch (error) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to retrieve estate',
                    error: error
                });
            }
        });
    }
    updateEstate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const estate = yield this.estateRepository.update(req.params.estateId, req.body);
                if (!estate) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'Estate not found'
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    message: 'Estate updated successfully',
                    data: estate
                });
            }
            catch (error) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to update estate',
                    error: error
                });
            }
        });
    }
    deleteEstate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.estateRepository.delete(req.params.estateId);
                if (!result) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'Estate not found'
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    message: 'Estate deleted successfully'
                });
            }
            catch (error) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to delete estate',
                    error: error
                });
            }
        });
    }
}
exports.default = new EstateController();
