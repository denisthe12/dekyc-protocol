export interface CompleteAuthorizationResult {
  code: string;
  redirectUri: string;
  redirectUriWithCode: string;
  consentId: string;
  serviceSubjectId: string;
  expiresAt: string;
}