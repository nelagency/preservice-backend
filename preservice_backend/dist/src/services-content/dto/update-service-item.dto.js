"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateServiceItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_service_item_dto_1 = require("./create-service-item.dto");
class UpdateServiceItemDto extends (0, swagger_1.PartialType)(create_service_item_dto_1.CreateServiceItemDto) {
}
exports.UpdateServiceItemDto = UpdateServiceItemDto;
//# sourceMappingURL=update-service-item.dto.js.map