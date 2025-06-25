import { UserRole } from '../../constants/user-roles.constant';

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  schoolId?: number;
  roles: UserRole[];
  creditBalance: number;
  is2FAEnabled: boolean;
  isEmailConfirmed: boolean;
  userSubscriptionResponse: {
    isSubscriptionActive: boolean;
    subscriptionEndDate: string;
  };
}
