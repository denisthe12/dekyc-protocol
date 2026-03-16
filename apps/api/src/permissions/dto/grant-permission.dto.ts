export class GrantPermissionDto {
  serviceId!: string;
  requiredTokenAmount?: number;
  allowedClaims?: string[];
}