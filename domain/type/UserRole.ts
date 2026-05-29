export const UserRole = {
  ADMIN: "ADMIN",
  MASTER: "MASTER",
  USER: "USER",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];


