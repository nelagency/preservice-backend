"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutContentModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const about_content_controller_1 = require("./about-content.controller");
const about_content_service_1 = require("./about-content.service");
const about_content_entity_1 = require("./entities/about-content.entity");
let AboutContentModule = class AboutContentModule {
};
exports.AboutContentModule = AboutContentModule;
exports.AboutContentModule = AboutContentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: about_content_entity_1.AboutContent.name, schema: about_content_entity_1.AboutContentSchema },
            ]),
        ],
        controllers: [about_content_controller_1.AboutContentController],
        providers: [about_content_service_1.AboutContentService],
    })
], AboutContentModule);
//# sourceMappingURL=about-content.module.js.map