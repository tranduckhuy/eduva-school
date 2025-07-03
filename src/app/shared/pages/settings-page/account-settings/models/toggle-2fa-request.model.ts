export interface RequestEnableDisable2FA {
  currentPassword: string;
}

export interface ConfirmEnableDisable2FA {
  otpCode: string;
}
