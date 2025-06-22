export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  requires2FA: boolean;
  email: string;
}
