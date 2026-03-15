export type CertificateLabResult = {
    nodeX509: {
        ownPropertyNames: string[];
        prototypePropertyNames: string[];
        enumerableSnapshot: Record<string, unknown>;
    };
    parsedNames: {
        subjectRaw: string;
        issuerRaw: string;
        subjectFields: Record<string, string>;
        issuerFields: Record<string, string>;
        subjectLines: string[];
        issuerLines: string[];
    };
    openssl: {
        text: string;
        subject: string;
        issuer: string;
        serial: string;
        dates: string;
        email: string;
        ocspUri: string;
        fingerprintSha256: string;
    };
};
export declare function analyzeCertificatePem(pem: string): CertificateLabResult;
