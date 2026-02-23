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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationSchema = exports.Participation = exports.AssignmentStatus = exports.CandidatureStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_entity_1 = require("../../events/entities/event.entity");
var CandidatureStatus;
(function (CandidatureStatus) {
    CandidatureStatus["pending"] = "pending";
    CandidatureStatus["approved"] = "approved";
    CandidatureStatus["rejected"] = "rejected";
})(CandidatureStatus || (exports.CandidatureStatus = CandidatureStatus = {}));
var AssignmentStatus;
(function (AssignmentStatus) {
    AssignmentStatus["none"] = "none";
    AssignmentStatus["provisional"] = "provisional";
    AssignmentStatus["confirmed"] = "confirmed";
})(AssignmentStatus || (exports.AssignmentStatus = AssignmentStatus = {}));
let Participation = class Participation {
    event;
    serveur;
    candidatureStatus;
    role;
    assignmentStatus;
    notes;
    approvedAt;
    assignedAt;
};
exports.Participation = Participation;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Event', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Participation.prototype, "event", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Serveur', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Participation.prototype, "serveur", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(CandidatureStatus), default: CandidatureStatus.pending }),
    __metadata("design:type", String)
], Participation.prototype, "candidatureStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(event_entity_1.EventRoleEnum), default: null }),
    __metadata("design:type", Object)
], Participation.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(AssignmentStatus), default: AssignmentStatus.none }),
    __metadata("design:type", String)
], Participation.prototype, "assignmentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Participation.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Participation.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Participation.prototype, "assignedAt", void 0);
exports.Participation = Participation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Participation);
exports.ParticipationSchema = mongoose_1.SchemaFactory.createForClass(Participation);
exports.ParticipationSchema.index({ event: 1, serveur: 1 }, { unique: true });
//# sourceMappingURL=participation.entity.js.map