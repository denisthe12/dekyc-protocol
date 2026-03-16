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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HkdfService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const env_1 = require("../config/env");
let HkdfService = class HkdfService {
    masterSecret;
    constructor() {
        this.masterSecret = Buffer.from((0, env_1.getRequiredEnv)('MASTER_SECRET'), 'utf8');
    }
    derivePermissionKey(params) {
        const version = params.version ?? 1;
        const userHash = (0, crypto_1.createHmac)('sha256', this.masterSecret)
            .update(params.userId)
            .digest('hex');
        const context = Buffer.from(`permission:${params.permissionId}|service:${params.serviceId}|user:${userHash}|v:${version}`, 'utf8');
        const key = (0, crypto_1.hkdfSync)('sha256', this.masterSecret, Buffer.alloc(0), context, 32);
        return Buffer.from(key).toString('hex');
    }
};
exports.HkdfService = HkdfService;
exports.HkdfService = HkdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HkdfService);
//# sourceMappingURL=hkdf.service.js.map