export enum ResendOtpPurpose {
  Login = 0,
  Enable2FA = 1,
  Disable2Fa = 2,
}

export interface ResendOtpRequest {
  email: string;
  purpose: ResendOtpPurpose;
}
