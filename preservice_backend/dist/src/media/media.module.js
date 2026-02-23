"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const media_asset_entity_1 = require("./entities/media-asset.entity");
const before_after_entity_1 = require("./entities/before-after.entity");
const media_controller_1 = require("./media.controller");
const media_service_1 = require("./media.service");
const r2_service_1 = require("./r2.service");
const stream_service_1 = require("./stream.service");
const event_entity_1 = require("../events/entities/event.entity");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: media_asset_entity_1.MediaAsset.name, schema: media_asset_entity_1.MediaAssetSchema },
                { name: before_after_entity_1.BeforeAfterPair.name, schema: before_after_entity_1.BeforeAfterPairSchema },
                { name: event_entity_1.Event.name, schema: event_entity_1.EventSchema },
            ])
        ],
        controllers: [media_controller_1.MediaController],
        providers: [media_service_1.MediaService, r2_service_1.R2Service, stream_service_1.StreamService],
        exports: [media_service_1.MediaService],
    })
], MediaModule);
//# sourceMappingURL=media.module.js.map