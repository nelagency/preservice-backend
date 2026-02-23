"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const demande_entity_1 = require("./entities/demande.entity");
const event_entity_1 = require("../events/entities/event.entity");
let DemandesService = class DemandesService {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(dto) {
        const payload = { ...dto };
        payload.client = new mongoose_2.Types.ObjectId(dto.client);
        payload.date_proposee = new Date(dto.date_proposee);
        const created = await this.model.create(payload);
        return created.toJSON();
    }
    async findAll() {
        return this.model.find().sort({ createdAt: -1 }).lean().populate('client', 'nom email');
    }
    async findOne(id) {
        const doc = await this.model.findById(id).lean().populate('client', 'nom email');
        if (!doc)
            throw new common_1.NotFoundException('Demande not found');
        return doc;
    }
    async update(id, dto) {
        const payload = { ...dto };
        if (dto.client)
            payload.client = new mongoose_2.Types.ObjectId(dto.client);
        if (dto.date_proposee)
            payload.date_proposee = new Date(dto.date_proposee);
        const updated = await this.model.findByIdAndUpdate(id, payload, { new: true }).lean().populate('client');
        if (!updated)
            throw new common_1.NotFoundException('Demande not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.model.findByIdAndDelete(id).lean();
        if (!deleted)
            throw new common_1.NotFoundException('Demande not found');
        return { success: true };
    }
    typesKV() {
        return Object.values(event_entity_1.EventTypeEnum).map(v => ({ key: v, value: v }));
    }
    statusesKV() {
        return Object.values(demande_entity_1.DemandeStatusEnum).map(v => ({ key: v, value: v }));
    }
};
exports.DemandesService = DemandesService;
exports.DemandesService = DemandesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(demande_entity_1.Demande.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DemandesService);
//# sourceMappingURL=demandes.service.js.map