export type DeKycConnectErrorCode =
  | 'invalid_client'
  | 'invalid_redirect_uri'
  | 'invalid_request'
  | 'consent_required'
  | 'code_expired'
  | 'code_consumed'
  | 'assertion_expired'
  | 'consent_revoked'
  | 'service_disabled'
  | 'unsupported_scope';

export interface DeKycConnectErrorDto {
  error: DeKycConnectErrorCode;
  errorDescription: string;
  requestId?: string;
}