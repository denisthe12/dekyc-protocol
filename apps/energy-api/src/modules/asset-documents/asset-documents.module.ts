import { Module } from '@nestjs/common';
import { AssetDocumentsController } from './asset-documents.controller';
import { AssetDocumentsService } from './asset-documents.service';
import { PrismaModule } from '@/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssetDocumentsController],
  providers: [AssetDocumentsService],
  exports: [AssetDocumentsService],
})
export class AssetDocumentsModule {}