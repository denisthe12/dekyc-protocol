import { Body, Controller, Post } from '@nestjs/common';
import { VerifyAssertionDto } from './dto/verify-assertion.dto';
import { IdentityAssertionsService } from './identity-assertions.service';

@Controller('connect/assertions')
export class IdentityAssertionsController {
  constructor(
    private readonly identityAssertionsService: IdentityAssertionsService,
  ) {}

  @Post('verify')
  verifyAssertion(@Body() body: VerifyAssertionDto) {
    return this.identityAssertionsService.verifyAssertion(body.assertionJws);
  }
}