"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuerMetadataModule = void 0;
const common_1 = require("@nestjs/common");
const identity_assertions_module_1 = require("../identity-assertions/identity-assertions.module");
const issuer_metadata_controller_1 = require("./issuer-metadata.controller");
const jwks_service_1 = require("./jwks.service");
let IssuerMetadataModule = class IssuerMetadataModule {
};
exports.IssuerMetadataModule = IssuerMetadataModule;
exports.IssuerMetadataModule = IssuerMetadataModule = __decorate([
    (0, common_1.Module)({
        imports: [identity_assertions_module_1.IdentityAssertionsModule],
        controllers: [issuer_metadata_controller_1.IssuerMetadataController],
        providers: [jwks_service_1.JwksService],
    })
], IssuerMetadataModule);
//# sourceMappingURL=issuer-metadata.module.js.map