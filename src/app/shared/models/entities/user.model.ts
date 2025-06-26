import { School } from './school.model';

import { UserRole } from '../../constants/user-roles.constant';
import { EntityStatus } from '../enum/entity-status.enum';

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  school?: School;
  roles: UserRole[];
  creditBalance: number;
  is2FAEnabled: boolean;
  isEmailConfirmed: boolean;
  status: EntityStatus;
  userSubscriptionResponse: {
    isSubscriptionActive: boolean;
    subscriptionEndDate: string;
  };
}
