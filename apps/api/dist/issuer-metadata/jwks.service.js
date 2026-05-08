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
exports.JwksService = void 0;
const common_1 = require("@nestjs/common");
const identity_assertions_signer_1 = require("../identity-assertions/identity-assertions.signer");
let JwksService = class JwksService {
    signer;
    constructor(signer) {
        this.signer = signer;
    }
    getJwks() {
        return this.signer.getPublicJwks();
    }
};
exports.JwksService = JwksService;
exports.JwksService = JwksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [identity_assertions_signer_1.IdentityAssertionsSigner])
], JwksService);
//# sourceMappingURL=jwks.service.js.map