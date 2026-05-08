import type { DeKycIdentityAssertionDto, DeKycVerifyAssertionResponseDto } from '@energy/shared';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityAssertionsSigner } from './identity-assertions.signer';
import type { CreateIdentityAssertionInput } from './types/create-identity-assertion-input.type';
export declare class IdentityAssertionsService {
    private readonly prisma;
    private readonly signer;
    constructor(prisma: PrismaService, signer: IdentityAssertionsSigner);
    createIdentityAssertion(input: CreateIdentityAssertionInput): Promise<DeKycIdentityAssertionDto>;
    verifyAssertion(assertionJws: string): Promise<DeKycVerifyAssertionResponseDto>;
    private normalizeClaimsScope;
    private generateAssertionId;
    private getIssuer;
    private getAssertionTtlSeconds;
    private toPrismaJsonObject;
}
