export class SaveAnalysisDto {
  challengeId!: string;
  parsedCertificate!: {
    subjectString: string;
    issuerString: string;
    serialNumberHex: string;
    notBefore: string;
    notAfter: string;
    fingerprintSha256: string;
    subjectCommonName: string | null;
    subjectOrganization: string | null;
    subjectOrgUnit: string | null;
    subjectCountry: string | null;
    probableIin: string | null;
  };
  cmsDebug!: {
    normalizedFormat: string;
    detectedKind: string;
    firstBytesHex: string;
    firstTextPreview: string;
    originalLength: string;
    trimmedLength: string;
  };
}