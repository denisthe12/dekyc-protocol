"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgeModule = void 0;
const common_1 = require("@nestjs/common");
const judge_controller_1 = require("./judge.controller");
const judge_service_1 = require("./judge.service");
const solana_module_1 = require("../solana/solana.module");
let JudgeModule = class JudgeModule {
};
exports.JudgeModule = JudgeModule;
exports.JudgeModule = JudgeModule = __decorate([
    (0, common_1.Module)({
        imports: [solana_module_1.SolanaModule],
        controllers: [judge_controller_1.JudgeController],
        providers: [judge_service_1.JudgeService],
        exports: [judge_service_1.JudgeService],
    })
], JudgeModule);
//# sourceMappingURL=judge.module.js.map