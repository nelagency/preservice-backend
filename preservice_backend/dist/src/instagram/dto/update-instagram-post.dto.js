"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInstagramPostDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_instagram_post_dto_1 = require("./create-instagram-post.dto");
class UpdateInstagramPostDto extends (0, swagger_1.PartialType)(create_instagram_post_dto_1.CreateInstagramPostDto) {
}
exports.UpdateInstagramPostDto = UpdateInstagramPostDto;
//# sourceMappingURL=update-instagram-post.dto.js.map