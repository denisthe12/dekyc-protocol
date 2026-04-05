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
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const prisma_module_1 = require("./modules/prisma/prisma.module");
const solana_module_1 = require("./modules/solana/solana.module");
const wallets_module_1 = require("./modules/wallets/wallets.module");
const energy_module_1 = require("./modules/energy/energy.module");
const energy_assets_module_1 = require("./modules/energy-assets/energy-assets.module");
const positions_module_1 = require("./modules/positions/positions.module");
const payouts_module_1 = require("./modules/payouts/payouts.module");
const judge_module_1 = require("./modules/judge/judge.module");
const otc_module_1 = require("./modules/otc/otc.module");
const dev_module_1 = require("./modules/dev/dev.module");
const history_module_1 = require("./modules/history/history.module");
const settings_module_1 = require("./modules/settings/settings.module");
const asset_documents_module_1 = require("./modules/asset-documents/asset-documents.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const asset_access_module_1 = require("./modules/asset-access/asset-access.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            solana_module_1.SolanaModule,
            wallets_module_1.WalletsModule,
            energy_module_1.EnergyModule,
            energy_assets_module_1.EnergyAssetsModule,
            positions_module_1.PositionsModule,
            payouts_module_1.PayoutsModule,
            judge_module_1.JudgeModule,
            otc_module_1.OtcModule,
            dev_module_1.DevModule,
            history_module_1.HistoryModule,
            settings_module_1.SettingsModule,
            asset_documents_module_1.AssetDocumentsModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'storage'),
                serveRoot: '/uploads',
            }),
            asset_access_module_1.AssetAccessModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map