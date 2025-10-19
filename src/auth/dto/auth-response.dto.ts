export class AuthResponseDto {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
  };
}

