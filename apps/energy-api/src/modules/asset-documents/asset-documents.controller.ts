import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetDocumentsService } from './asset-documents.service';
import { UploadAssetDocumentDto } from './dto/upload-asset-document.dto';
import { RebuildProofBundleDto } from './dto/rebuild-proof-bundle.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('asset-documents')
export class AssetDocumentsController {
  public constructor(
    private readonly assetDocumentsService: AssetDocumentsService,
  ) {}

  @Get(':assetId')
  public async listDocuments(@Param('assetId') assetId: string) {
    return this.assetDocumentsService.listDocuments(assetId);
  }

  @Post(':assetId/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  public async uploadDocument(
    @Param('assetId') assetId: string,
    @Body() dto: UploadAssetDocumentDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
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

  @Post(':assetId/rebuild-proof-bundle')
  @UseGuards(JwtAuthGuard)
  public async rebuildProofBundle(
    @Param('assetId') assetId: string,
    @Body() dto: RebuildProofBundleDto,
  ) {
    return this.assetDocumentsService.rebuildProofBundle({
      assetId,
      createdByEnergyUserId: dto.createdByEnergyUserId,
    });
  }
}