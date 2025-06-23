export const UserRoles = {
  SYSTEM_ADMIN: 'SystemAdmin',
  SCHOOL_ADMIN: 'SchoolAdmin',
  CONTENT_MODERATOR: 'ContentModerator',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
