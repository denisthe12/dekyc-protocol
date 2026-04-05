import { Module } from '@nestjs/common';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { AssetAccessService } from './asset-access.service';
import { AssetAccessController } from './asset-access.controller';

@Module({
  imports: [PrismaModule],
  providers: [AssetAccessService],
  controllers: [AssetAccessController],
  exports: [AssetAccessService],
})
export class AssetAccessModule {}