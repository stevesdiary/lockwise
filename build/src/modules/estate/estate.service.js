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
const estate_repository_1 = require("./estate.repository");
class EstateService {
    constructor() {
        this.estateRepository = new estate_repository_1.EstateRepository();
    }
    createEstate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.estateRepository.create(data);
        });
    }
    getAllEstates() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.estateRepository.findAll();
        });
    }
    getOneEstate(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.estateRepository.findById(id);
        });
    }
    updateEstate(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.estateRepository.update(id, data);
        });
    }
    deleteEstate(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.estateRepository.delete(id);
        });
    }
}
exports.default = new EstateService();
