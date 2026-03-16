import { Global, Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { HkdfService } from './hkdf.service';

@Global()
@Module({
  providers: [CryptoService, HkdfService],
  exports: [CryptoService, HkdfService],
})
export class CryptoModule {}