export class ServiceLoginDto {
  biometricMockId!: string;
  loginCode!: string;
  requestedClaims?: string[];
}