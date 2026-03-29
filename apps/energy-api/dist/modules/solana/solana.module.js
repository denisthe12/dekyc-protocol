"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaModule = void 0;
const common_1 = require("@nestjs/common");
const solana_controller_1 = require("./solana.controller");
const solana_service_1 = require("./solana.service");
const token_2022_service_1 = require("./token-2022.service");
const anchor_service_1 = require("./anchor.service");
let SolanaModule = class SolanaModule {
};
exports.SolanaModule = SolanaModule;
exports.SolanaModule = SolanaModule = __decorate([
    (0, common_1.Module)({
        controllers: [solana_controller_1.SolanaController],
        providers: [
            solana_service_1.SolanaService,
            token_2022_service_1.Token2022Service,
            {
                provide: anchor_service_1.AnchorService,
                useFactory: async (solanaService) => {
                    return anchor_service_1.AnchorService.create(solanaService);
                },
                inject: [solana_service_1.SolanaService],
            },
        ],
        exports: [solana_service_1.SolanaService, token_2022_service_1.Token2022Service, anchor_service_1.AnchorService],
    })
], SolanaModule);
//# sourceMappingURL=solana.module.js.map