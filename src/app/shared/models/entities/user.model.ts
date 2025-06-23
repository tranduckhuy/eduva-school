import { UserRole } from '../../constants/user-roles.constant';

export interface User {
  id: string;
  fullname: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  schoolId?: string;
  roles: UserRole[];
  creditBalance: number;
}
