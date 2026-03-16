import { PrismaService } from '../prisma/prisma.service';
import { UpsertKycProfileDto } from './dto/upsert-kyc-profile.dto';
export declare class KycProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertKycProfile(dto: UpsertKycProfileDto): Promise<{
        gender: string | null;
        id: string;
        userId: string;
        fullName: string | null;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        iin: string | null;
        email: string | null;
        birthDate: string | null;
        createdAt: Date;
        updatedAt: Date;
        country: string | null;
        status: string;
        source: string;
        profileJson: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getLatestUserKycProfile(userId: string): Promise<{
        gender: string | null;
        id: string;
        userId: string;
        fullName: string | null;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        iin: string | null;
        email: string | null;
        birthDate: string | null;
        createdAt: Date;
        updatedAt: Date;
        country: string | null;
        status: string;
        source: string;
        profileJson: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
}
