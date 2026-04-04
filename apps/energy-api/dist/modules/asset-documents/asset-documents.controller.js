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
exports.AssetDocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const asset_documents_service_1 = require("./asset-documents.service");
const upload_asset_document_dto_1 = require("./dto/upload-asset-document.dto");
const rebuild_proof_bundle_dto_1 = require("./dto/rebuild-proof-bundle.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let AssetDocumentsController = class AssetDocumentsController {
    constructor(assetDocumentsService) {
        this.assetDocumentsService = assetDocumentsService;
    }
    async listDocuments(assetId) {
        return this.assetDocumentsService.listDocuments(assetId);
    }
    async uploadDocument(assetId, dto, file) {
        if (!file) {
            throw new Error('File is required');
        }
        return this.assetDocumentsService.uploadDocument({
            assetId,
            documentType: dto.documentType,
            file: {
                buffer: file.buffer,
                mimetype: file.mimetype,
                originalname: dto.originalFileName || file.originalname,
                size: file.size,
            },
        });
    }
    async rebuildProofBundle(assetId, dto) {
        return this.assetDocumentsService.rebuildProofBundle({
            assetId,
            createdByEnergyUserId: dto.createdByEnergyUserId,
        });
    }
};
exports.AssetDocumentsController = AssetDocumentsController;
__decorate([
    (0, common_1.Get)(':assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetDocumentsController.prototype, "listDocuments", null);
__decorate([
    (0, common_1.Post)(':assetId/upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upload_asset_document_dto_1.UploadAssetDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], AssetDocumentsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)(':assetId/rebuild-proof-bundle'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rebuild_proof_bundle_dto_1.RebuildProofBundleDto]),
    __metadata("design:returntype", Promise)
], AssetDocumentsController.prototype, "rebuildProofBundle", null);
exports.AssetDocumentsController = AssetDocumentsController = __decorate([
    (0, common_1.Controller)('asset-documents'),
    __metadata("design:paramtypes", [asset_documents_service_1.AssetDocumentsService])
], AssetDocumentsController);
//# sourceMappingURL=asset-documents.controller.js.map