export class TokenRequestDto {
  grant_type?: string;
  grantType?: string;

  code!: string;

  redirect_uri?: string;
  redirectUri?: string;

  client_id?: string;
  clientId?: string;
}