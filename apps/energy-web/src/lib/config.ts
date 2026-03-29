export const ENERGY_API_BASE_URL =
  process.env.NEXT_PUBLIC_ENERGY_API_URL ?? 'http://localhost:3201/api';

export const DEKYC_API_BASE_URL =
  process.env.NEXT_PUBLIC_DEKYC_API_URL ?? 'http://localhost:3001/api';

export const DEKYC_SERVICE_ID =
  process.env.NEXT_PUBLIC_DEKYC_SERVICE_ID ?? '';

export const DEKYC_CLIENT_ID =
  process.env.NEXT_PUBLIC_DEKYC_CLIENT_ID ?? '';

export const DEFAULT_REQUESTED_CLAIMS = [
  'fullName',
  'iin',
  'birthDate',
  'email',
  'verified',
  'age18Plus',
];