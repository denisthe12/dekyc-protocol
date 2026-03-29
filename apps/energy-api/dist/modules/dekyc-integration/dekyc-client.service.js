"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DekycClientService = void 0;
const common_1 = require("@nestjs/common");
let DekycClientService = class DekycClientService {
    constructor() {
        this.baseUrl = process.env.DEKYC_API_BASE_URL ?? 'http://localhost:3001/api';
        this.serviceId = process.env.DEKYC_SERVICE_ID ?? '';
        this.clientId = process.env.DEKYC_CLIENT_ID ?? '';
        this.clientSecret = process.env.DEKYC_CLIENT_SECRET ?? '';
    }
    async login(params) {
        if (!this.serviceId || !this.clientId || !this.clientSecret) {
            throw new common_1.UnauthorizedException('DeKYC service credentials are not configured');
        }
        const timestamp = Date.now();
        const nonce = `energy-api-login-${timestamp}`;
        const response = await fetch(`${this.baseUrl}/service-auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': this.clientId,
                'x-client-secret': this.clientSecret,
                'x-timestamp': String(timestamp),
                'x-nonce': nonce,
            },
            body: JSON.stringify({
                biometricMockId: params.biometricMockId,
                loginCode: params.loginCode,
                requestedClaims: params.requestedClaims,
            }),
        });
        const rawText = await response.text();
        if (!response.ok) {
            throw new common_1.UnauthorizedException(`DeKYC login failed: ${response.status} ${rawText}`);
        }
        return JSON.parse(rawText);
    }
};
exports.DekycClientService = DekycClientService;
exports.DekycClientService = DekycClientService = __decorate([
    (0, common_1.Injectable)()
], DekycClientService);
//# sourceMappingURL=dekyc-client.service.js.map