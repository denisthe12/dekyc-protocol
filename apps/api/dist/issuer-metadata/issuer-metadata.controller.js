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
exports.IssuerMetadataController = void 0;
const common_1 = require("@nestjs/common");
const jwks_service_1 = require("./jwks.service");
let IssuerMetadataController = class IssuerMetadataController {
    jwksService;
    constructor(jwksService) {
        this.jwksService = jwksService;
    }
    getIssuerMetadata() {
        const issuer = process.env.DEKYC_CONNECT_ISSUER_URL ?? 'http://localhost:3001/api';
        return {
            issuer,
            authorization_endpoint: `${issuer}/connect/authorize`,
            token_endpoint: `${issuer}/connect/token`,
            jwks_uri: `${issuer}/.well-known/jwks.json`,
            assertion_verify_endpoint: `${issuer}/connect/assertions/verify`,
            supported_assertion_algorithms: ['HS256'],
            supported_response_types: ['code'],
            supported_grant_types: ['authorization_code'],
            supported_claims: [
                'fullName',
                'iin',
                'birthDate',
                'email',
                'verified',
                'age18Plus',
            ],
            note: 'MVP sandbox metadata. Production should use asymmetric signing and public JWKS.',
        };
    }
    getJwks() {
        return this.jwksService.getJwks();
    }
};
exports.IssuerMetadataController = IssuerMetadataController;
__decorate([
    (0, common_1.Get)('dekyc-issuer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IssuerMetadataController.prototype, "getIssuerMetadata", null);
__decorate([
    (0, common_1.Get)('jwks.json'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IssuerMetadataController.prototype, "getJwks", null);
exports.IssuerMetadataController = IssuerMetadataController = __decorate([
    (0, common_1.Controller)('.well-known'),
    __metadata("design:paramtypes", [jwks_service_1.JwksService])
], IssuerMetadataController);
//# sourceMappingURL=issuer-metadata.controller.js.map