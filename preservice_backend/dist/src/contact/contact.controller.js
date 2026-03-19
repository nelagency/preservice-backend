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
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const contact_service_1 = require("./contact.service");
const create_contact_message_dto_1 = require("./dto/create-contact-message.dto");
const update_contact_message_status_dto_1 = require("./dto/update-contact-message-status.dto");
let ContactController = class ContactController {
    contactService;
    constructor(contactService) {
        this.contactService = contactService;
    }
    create(dto) {
        return this.contactService.create(dto);
    }
    findAll() {
        return this.contactService.findAll();
    }
    updateStatus(id, dto) {
        return this.contactService.updateStatus(id, dto);
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Envoyer un message de contact',
        description: 'Endpoint public du formulaire de contact.',
        operationId: 'contactCreateMessage',
    }),
    (0, swagger_1.ApiBody)({ type: create_contact_message_dto_1.CreateContactMessageDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Message enregistré.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contact_message_dto_1.CreateContactMessageDto]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les messages de contact',
        description: 'Permet au dashboard admin de récupérer les messages reçus.',
        operationId: 'contactFindAllMessages',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Liste des messages.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Marquer un message comme traité',
        description: 'Met à jour le statut du message (pending/processed).',
        operationId: 'contactUpdateMessageStatus',
    }),
    (0, swagger_1.ApiBody)({ type: update_contact_message_status_dto_1.UpdateContactMessageStatusDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Statut mis à jour.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_contact_message_status_dto_1.UpdateContactMessageStatusDto]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "updateStatus", null);
exports.ContactController = ContactController = __decorate([
    (0, swagger_1.ApiTags)('Contact'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('contact/messages'),
    __metadata("design:paramtypes", [contact_service_1.ContactService])
], ContactController);
//# sourceMappingURL=contact.controller.js.map