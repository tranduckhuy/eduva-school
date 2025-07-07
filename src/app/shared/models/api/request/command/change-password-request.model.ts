import { type LogoutBehavior } from '../../../enum/logout-behavior.enum';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  logoutBehavior: LogoutBehavior;
}
