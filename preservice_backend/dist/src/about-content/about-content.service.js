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
exports.AboutContentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const about_content_entity_1 = require("./entities/about-content.entity");
let AboutContentService = class AboutContentService {
    model;
    constructor(model) {
        this.model = model;
    }
    async getContent() {
        const existing = await this.model.findOne({ key: 'main' }).lean();
        if (existing)
            return existing;
        const created = await this.model.create({
            key: 'main',
            vision: '',
            histoire: '',
            valeurs: [],
            founderImages: [],
            sections: [],
        });
        return created.toJSON();
    }
    async updateContent(dto) {
        return this.model
            .findOneAndUpdate({ key: 'main' }, { $set: dto, $setOnInsert: { key: 'main' } }, { upsert: true, new: true })
            .lean();
    }
};
exports.AboutContentService = AboutContentService;
exports.AboutContentService = AboutContentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(about_content_entity_1.AboutContent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AboutContentService);
//# sourceMappingURL=about-content.service.js.map