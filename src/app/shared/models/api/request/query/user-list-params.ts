import { EntityListParams } from './entity-list-params';

type UserRole =
  | 0 // System admin
  | 1 // School Admin
  | 2 // Content Moderator
  | 3 // Teacher
  | 4; // Student

export interface UserListParams extends EntityListParams {
  role: UserRole;
  schoolId?: number;
}
