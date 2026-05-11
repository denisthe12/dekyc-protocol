import { PrismaService } from '../prisma/prisma.service';
import { SubjectIdService } from './subject-id.service';
export declare class SubjectsService {
    private readonly prisma;
    private readonly subjectIdService;
    constructor(prisma: PrismaService, subjectIdService: SubjectIdService);
    ensureSubjectForUser(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        subjectId: string;
    }>;
    ensureServiceSubject(input: {
        userId: string;
        serviceId: string;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        serviceId: string;
        subjectId: string;
        serviceSubjectId: string;
    }>;
    findSubjectByUserId(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        subjectId: string;
    } | null>;
    findServiceSubject(input: {
        userId: string;
        serviceId: string;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        serviceId: string;
        subjectId: string;
        serviceSubjectId: string;
    } | null>;
    listServiceSubjectsForUser(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        serviceId: string;
        subjectId: string;
        serviceSubjectId: string;
    }[]>;
    private isUniqueConstraintError;
}
