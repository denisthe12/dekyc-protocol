import { Controller, Get } from '@nestjs/common';
import { JwksService } from './jwks.service';

@Controller('.well-known')
export class IssuerMetadataController {
  constructor(private readonly jwksService: JwksService) {}

  @Get('dekyc-issuer')
  getIssuerMetadata() {
    const issuer = process.env.DEKYC_CONNECT_ISSUER_URL ?? 'http://localhost:3001/api';

    return {
      issuer,
      authorization_endpoint: `${issuer}/connect/authorize`,
      token_endpoint: `${issuer}/connect/token`,
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      assertion_verify_endpoint: `${issuer}/connect/assertions/verify`,
      supported_assertion_algorithms: ['HS256'],
      supported_response_types: ['code'],
      supported_grant_types: ['authorization_code'],
      supported_claims: [
        'fullName',
        'iin',
        'birthDate',
        'email',
        'verified',
        'age18Plus',
      ],
      note: 'MVP sandbox metadata. Production should use asymmetric signing and public JWKS.',
    };
  }

  @Get('jwks.json')
  getJwks() {
    return this.jwksService.getJwks();
  }
}