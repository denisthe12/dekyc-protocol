"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtcModule = void 0;
const common_1 = require("@nestjs/common");
const otc_service_1 = require("./otc.service");
const otc_controller_1 = require("./otc.controller");
const solana_module_1 = require("../solana/solana.module");
let OtcModule = class OtcModule {
};
exports.OtcModule = OtcModule;
exports.OtcModule = OtcModule = __decorate([
    (0, common_1.Module)({
        imports: [solana_module_1.SolanaModule],
        providers: [otc_service_1.OtcService],
        controllers: [otc_controller_1.OtcController],
        exports: [otc_service_1.OtcService],
    })
], OtcModule);
//# sourceMappingURL=otc.module.js.map