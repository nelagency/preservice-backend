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
exports.AvisService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const avi_entity_1 = require("./entities/avi.entity");
let AvisService = class AvisService {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(dto) {
        const payload = {
            note: dto.note,
            commentaire: dto.commentaire,
            client: new mongoose_2.Types.ObjectId(dto.client),
            event: new mongoose_2.Types.ObjectId(dto.event),
            etat: dto.etat ?? true,
        };
        const created = await this.model.create(payload);
        return created.toJSON();
    }
    async findAll() {
        return this.model
            .find()
            .sort({ createdAt: -1 })
            .populate({ path: 'client', select: 'nom prenom email' })
            .populate({ path: 'event', select: 'type startdate enddate createdAt' })
            .lean();
    }
    async findOne(id) {
        const doc = await this.model
            .findById(id)
            .populate({ path: 'client', select: 'nom prenom email' })
            .populate({ path: 'event', select: 'type startdate enddate createdAt' })
            .lean();
        if (!doc)
            throw new common_1.NotFoundException('Avis not found');
        return doc;
    }
    async update(id, dto) {
        const payload = { ...dto };
        if (dto.client)
            payload.client = new mongoose_2.Types.ObjectId(dto.client);
        if (dto.event)
            payload.event = new mongoose_2.Types.ObjectId(dto.event);
        const updated = await this.model.findByIdAndUpdate(id, payload, { new: true }).lean().populate('client', 'event');
        if (!updated)
            throw new common_1.NotFoundException('Avis not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.model.findByIdAndDelete(id).lean();
        if (!deleted)
            throw new common_1.NotFoundException('Avis not found');
        return { success: true };
    }
};
exports.AvisService = AvisService;
exports.AvisService = AvisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(avi_entity_1.Avi.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AvisService);
//# sourceMappingURL=avis.service.js.map