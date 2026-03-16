import { PrismaService } from '../prisma/prisma.service';
import { SaveUserCertDto } from './dto/save-user-cert.dto';
export declare class UserCertService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    saveUserCert(dto: SaveUserCertDto): Promise<{
        validFrom: string | null;
        validTo: string | null;
        gender: string | null;
        id: string;
        certificateFingerprint256: string;
        userId: string;
        fullName: string | null;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        iin: string | null;
        email: string | null;
        birthDate: string | null;
        birthCentury: number | null;
        certificateSerialNumber: string | null;
        certificateIssuer: string | null;
        certificateSubject: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllUserCerts(): Promise<{
        validFrom: string | null;
        validTo: string | null;
        gender: string | null;
        id: string;
        certificateFingerprint256: string;
        userId: string;
        fullName: string | null;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        iin: string | null;
        email: string | null;
        birthDate: string | null;
        birthCentury: number | null;
        certificateSerialNumber: string | null;
        certificateIssuer: string | null;
        certificateSubject: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
