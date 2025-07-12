import { Role } from '../../../enum/role.enum';

export interface CreateUserRequest {
  fullName: string;
  email: string;
  initialPassword: string;
  role: Role;
}
