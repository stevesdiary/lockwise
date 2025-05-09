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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const estate_controller_1 = __importDefault(require("./estate.controller"));
const estateRouter = (0, express_1.Router)();
estateRouter.get('/health', (req, res) => {
    res.status(200).json({ message: "Healthy!" });
});
estateRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield estate_controller_1.default.createEstate(req, res);
}));
estateRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield estate_controller_1.default.getAllEstates(req, res);
}));
estateRouter.get('/:estateId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield estate_controller_1.default.getEstateById(req, res);
}));
estateRouter.put('/:estateId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield estate_controller_1.default.updateEstate(req, res);
}));
estateRouter.delete('/:estateId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield estate_controller_1.default.deleteEstate(req, res);
}));
exports.default = estateRouter;
