"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAviDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_avi_dto_1 = require("./create-avi.dto");
class UpdateAviDto extends (0, swagger_1.PartialType)(create_avi_dto_1.CreateAviDto) {
}
exports.UpdateAviDto = UpdateAviDto;
//# sourceMappingURL=update-avi.dto.js.map