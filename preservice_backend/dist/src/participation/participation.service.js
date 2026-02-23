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
exports.ParticipationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const participation_entity_1 = require("./entities/participation.entity");
const mail_service_1 = require("../mail/mail.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ParticipationService = class ParticipationService {
    model;
    eventModel;
    mail;
    notifications;
    constructor(model, eventModel, mail, notifications) {
        this.model = model;
        this.eventModel = eventModel;
        this.mail = mail;
        this.notifications = notifications;
    }
    async apply(eventId, serveurId, notes) {
        const event = await this.eventModel.findById(eventId).lean();
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        try {
            return await this.model.create({
                event: new mongoose_2.Types.ObjectId(eventId),
                serveur: new mongoose_2.Types.ObjectId(serveurId),
                candidatureStatus: participation_entity_1.CandidatureStatus.pending,
                notes,
            });
        }
        catch (e) {
            if (e?.code === 11000) {
                throw new common_1.BadRequestException('Déjà candidat sur cet évènement');
            }
            throw e;
        }
    }
    async applyEvent(eventId, serveurId, notes, adminIds) {
        const event = await this.eventModel.findById(eventId).lean();
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        try {
            const apply = await this.model.create({
                event: new mongoose_2.Types.ObjectId(eventId),
                serveur: new mongoose_2.Types.ObjectId(serveurId),
                candidatureStatus: participation_entity_1.CandidatureStatus.pending,
                notes,
            });
            await this.notifications.pushToAdmins({
                type: 'PARTICIPATION_REQUESTED',
                payload: { eventId, serveurId },
                actorId: serveurId,
                title: 'Demande de participation',
                message: 'Un serveur a postulé à un événement',
            });
            return apply;
        }
        catch (e) {
            if (e?.code === 11000) {
                throw new common_1.BadRequestException('Déjà candidat sur cet évènement');
            }
            throw e;
        }
    }
    async setCandidatureStatus(eventId, participationId, status) {
        const before = await this.model.findById(participationId).select('candidatureStatus').lean();
        const doc = await this.model.findByIdAndUpdate(participationId, {
            candidatureStatus: status,
            approvedAt: status === participation_entity_1.CandidatureStatus.approved ? new Date() : undefined,
        }, { new: true })
            .populate('serveur', 'email nom prenom')
            .lean();
        if (!doc)
            throw new common_1.NotFoundException('Participation not found');
        const justApproved = status === participation_entity_1.CandidatureStatus.approved && before?.candidatureStatus !== participation_entity_1.CandidatureStatus.approved;
        if (justApproved) {
            const event = await this.eventModel.findById(eventId).lean();
            if (event && doc.serveur?.email) {
                await this.mail.participationApproved(doc.serveur, event, {});
            }
        }
        return doc;
    }
    async setCandidatureStatusEvent(eventId, participationId, status, adminId) {
        const before = await this.model.findById(participationId).select('candidatureStatus').lean();
        const doc = await this.model.findByIdAndUpdate(participationId, {
            candidatureStatus: status,
            approvedAt: status === participation_entity_1.CandidatureStatus.approved ? new Date() : undefined,
        }, { new: true }).populate('serveur', 'email nom prenom').lean();
        if (!doc)
            throw new common_1.NotFoundException('Participation not found');
        const justApproved = status === participation_entity_1.CandidatureStatus.approved && before?.candidatureStatus !== participation_entity_1.CandidatureStatus.approved;
        const serveurIdStr = doc?.serveur?._id?.toString?.() ??
            doc?.serveur?.toString?.();
        if (justApproved && serveurIdStr) {
            const event = await this.eventModel.findById(eventId).lean();
            await this.notifications.pushToServeurs({
                type: 'PARTICIPATION_APPROVED',
                serveurIds: [doc.serveur._id.toString()],
                payload: { eventId },
                actorId: adminId,
                title: 'Participation confirmée',
                message: `Vous êtes affecté sur un événement ${event?.title}`,
            });
            if (event && doc.serveur?.email) {
                await this.mail.participationApproved(doc.serveur, event);
            }
        }
        return doc;
    }
    async assignRole(eventId, participationId, dto) {
        const event = await this.eventModel.findById(eventId).lean();
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        await this.ensureCapacity(eventId, event, dto.role, participationId);
        const doc = await this.model.findByIdAndUpdate(participationId, {
            role: dto.role,
            assignmentStatus: dto.assignmentStatus ?? participation_entity_1.AssignmentStatus.provisional,
            assignedAt: new Date(),
        }, { new: true });
        if (!doc)
            throw new common_1.BadRequestException('Participation introuvable ou non approuvée');
        return doc;
    }
    async ensureCapacity(eventId, event, role, excludeParticipationId) {
        const req = (event.positions ?? []).find((p) => p.role === role);
        if (!req?.capacity)
            return;
        const count = await this.model.countDocuments({
            event: eventId,
            role,
            assignmentStatus: { $in: [participation_entity_1.AssignmentStatus.provisional, participation_entity_1.AssignmentStatus.confirmed] },
            ...(excludeParticipationId ? { _id: { $ne: excludeParticipationId } } : {}),
        });
        if (count >= req.capacity) {
            throw new common_1.BadRequestException(`Capacité atteinte pour le poste ${role}`);
        }
    }
    async confirmAll(eventId) {
        await this.model.updateMany({ event: eventId, assignmentStatus: participation_entity_1.AssignmentStatus.provisional }, { $set: { assignmentStatus: participation_entity_1.AssignmentStatus.confirmed } });
    }
    async confirmAllEvent(eventId) {
        await this.model.updateMany({ event: eventId, assignmentStatus: participation_entity_1.AssignmentStatus.provisional }, { $set: { assignmentStatus: participation_entity_1.AssignmentStatus.confirmed } });
    }
    async bulkReplaceAssignments(eventId, payload) {
        const event = await this.eventModel.findById(eventId).lean();
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const byRole = {};
        for (const a of payload.assignments) {
            byRole[a.role] = (byRole[a.role] ?? 0) + 1;
        }
        for (const role of Object.keys(byRole)) {
            const req = (event.positions ?? []).find((p) => p.role === role);
            if (req?.capacity && byRole[role] > req.capacity) {
                throw new common_1.BadRequestException(`Dépassement de capacité pour ${role} (${byRole[role]}>${req.capacity})`);
            }
        }
        const session = await this.model.db.startSession();
        await session.withTransaction(async () => {
            await this.model.updateMany({ event: eventId }, { $set: { role: null, assignmentStatus: participation_entity_1.AssignmentStatus.none } }, { session });
            for (const a of payload.assignments) {
                await this.model.updateOne({ event: eventId, serveur: a.serveurId }, {
                    $set: {
                        candidatureStatus: participation_entity_1.CandidatureStatus.approved,
                        role: a.role,
                        assignmentStatus: a.assignmentStatus ?? participation_entity_1.AssignmentStatus.provisional,
                        assignedAt: new Date(),
                    },
                }, { upsert: true, session });
            }
        });
        session.endSession();
    }
    async kpis(eventId) {
        const [confirmed, pending, assigned, totalReq] = await Promise.all([
            this.model.countDocuments({ event: eventId, assignmentStatus: participation_entity_1.AssignmentStatus.confirmed }),
            this.model.countDocuments({
                event: eventId,
                candidatureStatus: participation_entity_1.CandidatureStatus.pending,
            }),
            this.model.countDocuments({
                event: eventId,
                role: { $ne: null },
                assignmentStatus: { $in: [participation_entity_1.AssignmentStatus.provisional, participation_entity_1.AssignmentStatus.confirmed] },
            }),
            this.totalSlots(eventId),
        ]);
        const unassigned = Math.max(totalReq - assigned, 0);
        return { confirmed, pending, unassigned, total: totalReq };
    }
    async totalSlots(eventId) {
        const event = await this.eventModel.findById(eventId).lean();
        const sum = (event?.positions ?? []).reduce((acc, p) => acc + (p.capacity ?? 0), 0);
        if (!sum) {
            return this.model.countDocuments({ event: eventId });
        }
        return sum;
    }
    async findByEvent(eventId) {
        if (!mongoose_2.Types.ObjectId.isValid(eventId)) {
            throw new common_1.BadRequestException('eventId invalide');
        }
        return this.model
            .find({ event: new mongoose_2.Types.ObjectId(eventId) })
            .populate('serveur', 'nom prenom status email')
            .populate('event')
            .lean();
    }
    async findByServeur(serveurId) {
        if (!mongoose_2.Types.ObjectId.isValid(serveurId)) {
            throw new common_1.BadRequestException('serveurId invalide');
        }
        return this.model
            .find({ serveur: new mongoose_2.Types.ObjectId(serveurId) })
            .populate('serveur', 'event')
            .lean();
    }
    create(createParticipationDto) {
        return 'This action adds a new participation';
    }
    findAll() {
        return this.model.find().populate('serveur', 'event');
    }
    findOne(id) {
        return this.model.findById(id).populate('serveur', 'event');
    }
    update(id, updateParticipationDto) {
        return `This action updates a #${id} participation`;
    }
    async remove(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.BadRequestException('id invalide');
        const doc = await this.model.findByIdAndDelete(id);
        if (!doc)
            throw new common_1.NotFoundException('Participation not found');
        return { ok: true };
    }
};
exports.ParticipationService = ParticipationService;
exports.ParticipationService = ParticipationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(participation_entity_1.Participation.name)),
    __param(1, (0, mongoose_1.InjectModel)(Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService,
        notifications_service_1.NotificationsService])
], ParticipationService);
//# sourceMappingURL=participation.service.js.map