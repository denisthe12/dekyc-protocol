import { Injectable } from '@nestjs/common';
import { IdentityAssertionsSigner } from '../identity-assertions/identity-assertions.signer';

@Injectable()
export class JwksService {
  constructor(private readonly signer: IdentityAssertionsSigner) {}

  getJwks() {
    return this.signer.getPublicJwks();
  }
}