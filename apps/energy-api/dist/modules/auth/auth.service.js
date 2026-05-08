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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const dekyc_client_service_1 = require("../dekyc-integration/dekyc-client.service");
let AuthService = class AuthService {
    constructor(jwtService, usersService, dekycClientService) {
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.dekycClientService = dekycClientService;
    }
    async loginViaDekycServer(dto) {
        const envelope = await this.dekycClientService.login({
            biometricMockId: dto.biometricMockId,
            loginCode: dto.loginCode,
            requestedClaims: dto.requestedClaims,
        });
        return this.finalizeDekycLogin({
            envelope,
        });
    }
    async loginViaDekycCallback(dto) {
        return this.finalizeDekycLogin(dto);
    }
    async finalizeDekycLogin(dto) {
        const { envelope } = dto;
        if (!envelope.payload.allowed) {
            throw new common_1.UnauthorizedException(envelope.payload.reason || 'DeKYC access denied');
        }
        const user = await this.usersService.findOrCreateFromDekycEnvelope({
            dekycUserId: envelope.resolvedUserId,
            claims: envelope.payload.claims,
        });
        const accessToken = this.jwtService.sign({
            sub: user.id,
        });
        return {
            accessToken,
            user: {
                id: user.id,
                dekycUserId: user.dekycUserId,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }
    async loginViaDekycConnect(dto) {
        const tokenResponse = await this.dekycClientService.exchangeConnectCode({
            code: dto.code,
            redirectUri: dto.redirectUri,
        });
        if (tokenResponse.tokenType !== 'dekyc_identity_assertion') {
            throw new common_1.UnauthorizedException('Unexpected DeKYC Connect token type');
        }
        if (tokenResponse.identityAssertion.payload.revocationStatus !== 'active') {
            throw new common_1.UnauthorizedException('DeKYC Connect consent is not active');
        }
        const nowSeconds = Math.floor(Date.now() / 1000);
        if (tokenResponse.identityAssertion.payload.exp <= nowSeconds) {
            throw new common_1.UnauthorizedException('DeKYC Connect assertion expired');
        }
        const claims = tokenResponse.minimalClaims ?? {};
        const user = await this.usersService.findOrCreateFromDekycEnvelope({
            dekycUserId: tokenResponse.identityAssertion.payload.serviceSubjectId,
            claims,
        });
        const accessToken = this.jwtService.sign({
            sub: user.id,
            dekycConnect: {
                assertionId: tokenResponse.identityAssertion.payload.assertionId,
                consentId: tokenResponse.consentReceipt.consentId,
                serviceSubjectId: tokenResponse.identityAssertion.payload.serviceSubjectId,
            },
        });
        return {
            accessToken,
            user: {
                id: user.id,
                dekycUserId: user.dekycUserId,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
            dekycConnect: {
                assertionId: tokenResponse.identityAssertion.payload.assertionId,
                consentId: tokenResponse.consentReceipt.consentId,
                serviceSubjectId: tokenResponse.identityAssertion.payload.serviceSubjectId,
                consentReceiptHash: tokenResponse.consentReceipt.receiptHash,
                assertionExpiresAt: new Date(tokenResponse.identityAssertion.payload.exp * 1000).toISOString(),
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService,
        dekyc_client_service_1.DekycClientService])
], AuthService);
//# sourceMappingURL=auth.service.js.map