"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateParticipationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_participation_dto_1 = require("./create-participation.dto");
class UpdateParticipationDto extends (0, swagger_1.PartialType)(create_participation_dto_1.CreateParticipationDto) {
}
exports.UpdateParticipationDto = UpdateParticipationDto;
//# sourceMappingURL=update-participation.dto.js.map