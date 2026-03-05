export const UnitRole = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type UnitRole = typeof UnitRole[keyof typeof UnitRole];


