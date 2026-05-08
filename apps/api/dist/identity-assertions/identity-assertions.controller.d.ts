import { VerifyAssertionDto } from './dto/verify-assertion.dto';
import { IdentityAssertionsService } from './identity-assertions.service';
export declare class IdentityAssertionsController {
    private readonly identityAssertionsService;
    constructor(identityAssertionsService: IdentityAssertionsService);
    verifyAssertion(body: VerifyAssertionDto): Promise<import("@energy/shared").DeKycVerifyAssertionResponseDto>;
}
