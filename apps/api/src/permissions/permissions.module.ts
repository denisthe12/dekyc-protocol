import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { ServicesModule } from '../services/services.module';
import { PermissionScopeGrantsModule } from '../permission-scope-grants/permission-scope-grants.module';

@Module({
  imports: [ServicesModule, PermissionScopeGrantsModule],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}