export declare class SubjectIdService {
    generateSubjectId(userId: string): string;
    generateServiceSubjectId(input: {
        userId: string;
        serviceId: string;
        subjectId: string;
    }): string;
    private buildPublicId;
    private getNamespaceSecret;
}
