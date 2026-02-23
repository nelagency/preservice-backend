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
exports.TimesheetSchema = exports.Timesheet = exports.TsPaymentSchema = exports.TsPayment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TsPayment = class TsPayment {
    amount;
    note;
    createdBy;
    createdAt;
};
exports.TsPayment = TsPayment;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0.01 }),
    __metadata("design:type", Number)
], TsPayment.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TsPayment.prototype, "note", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TsPayment.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], TsPayment.prototype, "createdAt", void 0);
exports.TsPayment = TsPayment = __decorate([
    (0, mongoose_1.Schema)({ _id: false, timestamps: { createdAt: true, updatedAt: false } })
], TsPayment);
exports.TsPaymentSchema = mongoose_1.SchemaFactory.createForClass(TsPayment);
let Timesheet = class Timesheet {
    event;
    serveur;
    startAt;
    endAt;
    breakMinutes;
    workedMinutes;
    status;
    note;
    validatedBy;
    validatedAt;
    validationComment;
    paidAmount;
    paymentStatus;
    payments;
    paidAt;
    paidBy;
};
exports.Timesheet = Timesheet;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Event', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Timesheet.prototype, "event", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Serveur', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Timesheet.prototype, "serveur", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Timesheet.prototype, "startAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Timesheet.prototype, "endAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], Timesheet.prototype, "breakMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0 }),
    __metadata("design:type", Number)
], Timesheet.prototype, "workedMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['submitted', 'approved', 'rejected'], default: 'submitted' }),
    __metadata("design:type", String)
], Timesheet.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Timesheet.prototype, "note", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Timesheet.prototype, "validatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Timesheet.prototype, "validatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Timesheet.prototype, "validationComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], Timesheet.prototype, "paidAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' }),
    __metadata("design:type", String)
], Timesheet.prototype, "paymentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.TsPaymentSchema], default: [] }),
    __metadata("design:type", Array)
], Timesheet.prototype, "payments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Timesheet.prototype, "paidAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Timesheet.prototype, "paidBy", void 0);
exports.Timesheet = Timesheet = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Timesheet);
exports.TimesheetSchema = mongoose_1.SchemaFactory.createForClass(Timesheet);
exports.TimesheetSchema.index({ event: 1, serveur: 1 }, { unique: true });
//# sourceMappingURL=timesheet.entity.js.map