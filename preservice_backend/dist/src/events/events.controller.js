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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    create(createEventDto) {
        return this.eventsService.create(createEventDto);
    }
    findAll() {
        return this.eventsService.findAll();
    }
    findOne(id) {
        return this.eventsService.findOne(id);
    }
    update(id, updateEventDto) {
        return this.eventsService.update(id, updateEventDto);
    }
    remove(id) {
        return this.eventsService.remove(id);
    }
    kpi() { return this.eventsService.kpi(); }
    recent() { return this.eventsService.recent(); }
    typesPercent() { return this.eventsService.typesPercent(); }
    typesKV() { return this.eventsService.typesKV(); }
    statusesKV() { return this.eventsService.statusesKV(); }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: "Création d'un événement",
        description: "Crée un nouvel événement (type, date, lieu, etc.).",
        operationId: 'eventsCreate',
    }),
    (0, swagger_1.ApiBody)({
        type: create_event_dto_1.CreateEventDto,
        examples: {
            default: {
                value: {
                    title: "Mariage Ali & Ines",
                    description: "description",
                    location: "Salle des Fêtes - Sfax",
                    startdate: "2025-12-20T17:00:00.000Z",
                    enddate: "2025-12-20T17:00:00.000Z",
                    type: "Mariages",
                    serveurs: [],
                    nbServeur: 18,
                    guests: 180,
                    status: "En attente",
                    amount: 4500,
                    etat: "Urgent"
                }
            }
        }
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Événement créé.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Liste des événements',
        description: 'Retourne tous les événements (sans pagination), triés par date décroissante.',
        operationId: 'eventsFindAll',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Liste de tous les événements.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Détail d'un événement",
        description: "Retourne un événement par identifiant.",
        operationId: 'eventsFindOne',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Détail de l’événement.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Mise à jour d'un événement",
        description: "Met à jour les champs d’un événement existant.",
        operationId: 'eventsUpdate',
    }),
    (0, swagger_1.ApiBody)({
        type: update_event_dto_1.UpdateEventDto,
        examples: {
            statusOnly: { value: { status: "confirme" } },
            full: {
                value: {
                    title: "Mariage Ali & Ines (MAJ)",
                    location: "Sousse",
                    date: "2025-12-21T18:00:00.000Z",
                    type: "Buffets",
                    guests: 200,
                    amount: 5200
                }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Événement mis à jour.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Suppression d'un événement",
        description: 'Supprime un événement par identifiant.',
        operationId: 'eventsDelete',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Événement supprimé.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('analytics/kpi'),
    (0, swagger_1.ApiOperation)({
        summary: 'KPI événements (mois vs mois précédent)',
        description: 'Retourne 4 KPI (événements, serveurs actifs, demandes en attente, revenus).',
        operationId: 'eventsKpi',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'KPI du mois courant vs mois précédent.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "kpi", null);
__decorate([
    (0, common_1.Get)('analytics/recent'),
    (0, swagger_1.ApiOperation)({
        summary: 'Événements ajoutés récemment',
        description: 'Retourne les 4 derniers événements créés.',
        operationId: 'eventsRecent',
    }),
    (0, swagger_1.ApiOkResponse)({ description: '4 événements ajoutés récemment.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "recent", null);
__decorate([
    (0, common_1.Get)('analytics/types/percent'),
    (0, swagger_1.ApiOperation)({
        summary: 'Répartition par type',
        description: 'Retourne le nombre et le pourcentage des événements par type.',
        operationId: 'eventsTypesPercent',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Répartition par type (percent + count).' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "typesPercent", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('meta/types'),
    (0, swagger_1.ApiOperation)({
        summary: "Types d'événement",
        description: "Retourne l'énumération des types { key, value }.",
        operationId: 'eventsTypesMeta',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Énum des types (key/value).' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "typesKV", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('meta/statuses'),
    (0, swagger_1.ApiOperation)({
        summary: "Statuts d'événement",
        description: "Retourne l'énumération des statuts { key, value }.",
        operationId: 'eventsStatusesMeta',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Énum des statuts (key/value).' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "statusesKV", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map