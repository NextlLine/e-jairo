export const TeamRole = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type TeamRole = typeof TeamRole[keyof typeof TeamRole];