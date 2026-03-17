"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const eds_module_1 = require("./eds/eds.module");
const prisma_module_1 = require("./prisma/prisma.module");
const user_cert_module_1 = require("./user-cert/user-cert.module");
const dev_bootstrap_service_1 = require("./dev/dev-bootstrap.service");
const kyc_profile_module_1 = require("./kyc-profile/kyc-profile.module");
const crypto_module_1 = require("./crypto/crypto.module");
const kyc_vault_module_1 = require("./kyc-vault/kyc-vault.module");
const auth_module_1 = require("./auth/auth.module");
const services_module_1 = require("./services/services.module");
const permissions_module_1 = require("./permissions/permissions.module");
const service_api_module_1 = require("./service-api/service-api.module");
const solana_module_1 = require("./solana/solana.module");
const permission_scope_grants_module_1 = require("./permission-scope-grants/permission-scope-grants.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            crypto_module_1.CryptoModule,
            auth_module_1.AuthModule,
            user_cert_module_1.UserCertModule,
            kyc_profile_module_1.KycProfileModule,
            kyc_vault_module_1.KycVaultModule,
            eds_module_1.EdsModule,
            permissions_module_1.PermissionsModule,
            services_module_1.ServicesModule,
            service_api_module_1.ServiceApiModule,
            solana_module_1.SolanaModule,
            permission_scope_grants_module_1.PermissionScopeGrantsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, dev_bootstrap_service_1.DevBootstrapService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map