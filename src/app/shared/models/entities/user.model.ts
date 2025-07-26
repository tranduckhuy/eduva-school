import { type School } from './school.model';

import { type UserRoleType } from '../../constants/user-roles.constant';
import { type EntityStatus } from '../enum/entity-status.enum';

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  school?: School;
  roles: UserRoleType[];
  creditBalance: number;
  is2FAEnabled: boolean;
  isEmailConfirmed: boolean;
  status: EntityStatus;
  userSubscriptionResponse: {
    isSubscriptionActive: boolean;
    subscriptionEndDate: string;
  };
}
