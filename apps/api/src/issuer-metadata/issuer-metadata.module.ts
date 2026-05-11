import { Module } from '@nestjs/common';
import { IdentityAssertionsModule } from '../identity-assertions/identity-assertions.module';
import { IssuerMetadataController } from './issuer-metadata.controller';
import { JwksService } from './jwks.service';

@Module({
  imports: [IdentityAssertionsModule],
  controllers: [IssuerMetadataController],
  providers: [JwksService],
})
export class IssuerMetadataModule {}