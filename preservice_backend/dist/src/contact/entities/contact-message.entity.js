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
exports.ContactMessageSchema = exports.ContactMessage = exports.ContactMessageStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const mongoose_1 = require("@nestjs/mongoose");
var ContactMessageStatus;
(function (ContactMessageStatus) {
    ContactMessageStatus["pending"] = "pending";
    ContactMessageStatus["processed"] = "processed";
})(ContactMessageStatus || (exports.ContactMessageStatus = ContactMessageStatus = {}));
let ContactMessage = class ContactMessage {
    fullName;
    email;
    phone;
    message;
    status;
};
exports.ContactMessage = ContactMessage;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Fatou Ndiaye' }),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'fatou@example.com' }),
    (0, mongoose_1.Prop)({ required: true, trim: true, lowercase: true, index: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+221771234567', required: false }),
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Demande de devis pour un mariage en juillet.' }),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ContactMessage.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ContactMessageStatus,
        default: ContactMessageStatus.pending,
    }),
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(ContactMessageStatus),
        default: ContactMessageStatus.pending,
        index: true,
    }),
    __metadata("design:type", String)
], ContactMessage.prototype, "status", void 0);
exports.ContactMessage = ContactMessage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ContactMessage);
exports.ContactMessageSchema = mongoose_1.SchemaFactory.createForClass(ContactMessage);
//# sourceMappingURL=contact-message.entity.js.map