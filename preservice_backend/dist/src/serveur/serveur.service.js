"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServeurService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const serveur_entity_1 = require("./entities/serveur.entity");
const bcrypt = __importStar(require("bcryptjs"));
const event_entity_1 = require("../events/entities/event.entity");
const participation_entity_1 = require("../participation/entities/participation.entity");
const SALT_ROUNDS = 10;
const sanitizeEmail = (e) => (e ?? '').trim().toLowerCase();
let ServeurService = class ServeurService {
    model;
    eventModel;
    participationModel;
    constructor(model, eventModel, participationModel) {
        this.model = model;
        this.eventModel = eventModel;
        this.participationModel = participationModel;
    }
    async create(dto) {
        const email = sanitizeEmail(dto.email);
        const exists = await this.model.exists({ email });
        if (exists)
            throw new common_1.ConflictException('Email déjà utilisé');
        const hashed = await bcrypt.hash(dto.mot_passe, SALT_ROUNDS);
        const created = await this.model.create({
            ...dto,
            email,
            mot_passe: hashed
        });
        const plain = created.toObject();
        delete plain.mot_passe;
        return plain;
    }
    findAll() {
        return this.model.find({}, { mot_passe: 0 }).sort({ nom: 1, prenom: 1 }).lean();
        ;
    }
    async findOne(id) {
        const doc = await this.model.findById(id, { mot_passe: 0 }).lean();
        if (!doc)
            throw new common_1.NotFoundException('Serveur not found');
        return doc;
    }
    async update(id, dto) {
        const update = { ...dto };
        if (dto.email) {
            update.email = sanitizeEmail(dto.email);
            const conflict = await this.model.exists({ _id: { $ne: id }, email: update.email });
            if (conflict)
                throw new common_1.ConflictException('Email déjà utilisé');
        }
        if (dto.mot_passe) {
            update.mot_passe = await bcrypt.hash(dto.mot_passe, SALT_ROUNDS);
        }
        const updated1 = await this.model.findByIdAndUpdate(id, { $set: update }, { new: true, fields: { mot_passe: 0 } }).lean();
        if (!updated1)
            throw new common_1.NotFoundException('Serveur not found');
        return updated1;
    }
    async remove(id) {
        const deleted = await this.model.findByIdAndDelete(id).lean();
        if (!deleted)
            throw new common_1.NotFoundException('Serveur not found');
        return { success: true };
    }
    serveurStatusesKV() {
        return Object.entries(serveur_entity_1.ServeurStatus).map(([key, value]) => ({ key, value }));
    }
    async listAssignedEvents(serverId) {
        const sid = new mongoose_2.Types.ObjectId(serverId);
        const parts = await this.participationModel.find({ serveur: sid }).populate('event').lean();
        return parts.map(p => {
            const ev = p.event;
            const iso = (ev?.startdate instanceof Date ? ev.startdate.toISOString().slice(0, 10) : (ev?.startdate || ''));
            return {
                _id: ev?._id?.toString() || p._id.toString(),
                title: ev?.title || 'Événement',
                date: iso,
                role: p.role || 'Non assigné',
                active: !!ev && new Date(ev.startdate) <= new Date() ? true : false,
            };
        });
    }
    async changePassword(id, { currentPassword, newPassword }) {
        const srv = await this.model.findById(id);
        if (!srv)
            throw new common_1.NotFoundException('Serveur introuvable');
        const hashField = srv.mot_passe;
        const ok = await bcrypt.compare(currentPassword, hashField);
        if (!ok) {
            throw new Error('Mot de passe actuel invalide');
        }
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);
        if (typeof srv.mot_passe !== 'undefined')
            srv.mot_passe = newHash;
        srv.passwordChangedAt = new Date();
        await srv.save();
        return { success: true };
    }
};
exports.ServeurService = ServeurService;
exports.ServeurService = ServeurService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(serveur_entity_1.Serveur.name)),
    __param(1, (0, mongoose_1.InjectModel)(event_entity_1.Event.name)),
    __param(2, (0, mongoose_1.InjectModel)(participation_entity_1.Participation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ServeurService);
//# sourceMappingURL=serveur.service.js.map