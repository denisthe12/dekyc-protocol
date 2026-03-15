export type CertificateLabInput = {
    parsedNames: {
        subjectFields: Record<string, string>;
        issuerFields: Record<string, string>;
    };
    openssl: {
        email: string;
    };
    nodeX509: {
        enumerableSnapshot: {
            validFrom?: string;
            validTo?: string;
            fingerprint256?: string;
            serialNumber?: string;
            issuer?: string;
            subject?: string;
        };
    };
};
export type ExtractedCertificateIdentity = {
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    middleName: string | null;
    iin: string | null;
    email: string | null;
    birthDate: string | null;
    gender: 'male' | 'female' | null;
    birthCentury: number | null;
    certificateSerialNumber: string | null;
    certificateFingerprint256: string | null;
    certificateValidFrom: string | null;
    certificateValidTo: string | null;
    certificateIssuer: string | null;
    certificateSubject: string | null;
    rawSubjectFields: Record<string, string>;
    rawIssuerFields: Record<string, string>;
};
export declare function extractCertificateIdentity(lab: CertificateLabInput): ExtractedCertificateIdentity;
