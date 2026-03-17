import { Module } from '@nestjs/common';
import { PermissionScopeGrantsService } from './permission-scope-grants.service';

@Module({
  providers: [PermissionScopeGrantsService],
  exports: [PermissionScopeGrantsService],
})
export class PermissionScopeGrantsModule {}