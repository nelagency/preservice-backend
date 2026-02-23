"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const util_1 = require("util");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    safePayload(val) {
        try {
            JSON.stringify(val);
            return val;
        }
        catch {
            if (val && typeof val === 'object' && 'message' in val) {
                return { message: val.message };
            }
            return { message: 'Internal error' };
        }
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const logBody = exception?.stack ??
            (0, util_1.inspect)(exception, { depth: 3, breakLength: 120 });
        this.logger.error(`${req.method} ${req.url} -> ${status}\n${logBody}`);
        const base = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : { message: exception?.message ?? 'Internal Server Error' };
        const payload = this.safePayload(base);
        res.status(status).json({
            statusCode: status,
            path: req.url,
            error: payload,
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map