type UserRole =
  | 'SystemAdmin'
  | 'SchoolAdmin'
  | 'ContentModerator'
  | 'Teacher'
  | 'Student';

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
