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
exports.JudgeController = void 0;
const common_1 = require("@nestjs/common");
const judge_service_1 = require("./judge.service");
let JudgeController = class JudgeController {
    constructor(judgeService) {
        this.judgeService = judgeService;
    }
    async getSummary() {
        return this.judgeService.getJudgeSummary();
    }
};
exports.JudgeController = JudgeController;
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JudgeController.prototype, "getSummary", null);
exports.JudgeController = JudgeController = __decorate([
    (0, common_1.Controller)('judge'),
    __metadata("design:paramtypes", [judge_service_1.JudgeService])
], JudgeController);
//# sourceMappingURL=judge.controller.js.map