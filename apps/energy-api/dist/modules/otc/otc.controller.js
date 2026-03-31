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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtcController = void 0;
const common_1 = require("@nestjs/common");
const otc_service_1 = require("./otc.service");
const create_demo_listing_dto_1 = require("./dto/create-demo-listing.dto");
const fill_demo_listing_dto_1 = require("./dto/fill-demo-listing.dto");
let OtcController = class OtcController {
    constructor(otcService) {
        this.otcService = otcService;
    }
    async createDemoListing(dto) {
        return this.otcService.createDemoListing(dto);
    }
    async fillDemoListing(dto) {
        return this.otcService.fillDemoListing(dto);
    }
    async listOpenListings() {
        return this.otcService.listOpenListings();
    }
};
exports.OtcController = OtcController;
__decorate([
    (0, common_1.Post)('create-demo-listing'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_demo_listing_dto_1.CreateDemoListingDto]),
    __metadata("design:returntype", Promise)
], OtcController.prototype, "createDemoListing", null);
__decorate([
    (0, common_1.Post)('fill-demo-listing'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fill_demo_listing_dto_1.FillDemoListingDto]),
    __metadata("design:returntype", Promise)
], OtcController.prototype, "fillDemoListing", null);
__decorate([
    (0, common_1.Get)('listings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OtcController.prototype, "listOpenListings", null);
exports.OtcController = OtcController = __decorate([
    (0, common_1.Controller)('otc'),
    __metadata("design:paramtypes", [otc_service_1.OtcService])
], OtcController);
//# sourceMappingURL=otc.controller.js.map