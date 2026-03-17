export const PERMISSION_SCOPES = [
  'kyc.full_name',
  'kyc.email',
  'kyc.iin',
  'kyc.birth_date',
  'kyc.gender',
  'kyc.country',
  'kyc.verified',
  'kyc.age_18_plus',
] as const;

export type PermissionScope = (typeof PERMISSION_SCOPES)[number];

export const CLAIM_TO_SCOPE: Record<string, PermissionScope> = {
  fullName: 'kyc.full_name',
  email: 'kyc.email',
  iin: 'kyc.iin',
  birthDate: 'kyc.birth_date',
  gender: 'kyc.gender',
  country: 'kyc.country',
  verified: 'kyc.verified',
  age18Plus: 'kyc.age_18_plus',
};

export const SCOPE_TO_CLAIM: Record<PermissionScope, string> = {
  'kyc.full_name': 'fullName',
  'kyc.email': 'email',
  'kyc.iin': 'iin',
  'kyc.birth_date': 'birthDate',
  'kyc.gender': 'gender',
  'kyc.country': 'country',
  'kyc.verified': 'verified',
  'kyc.age_18_plus': 'age18Plus',
};