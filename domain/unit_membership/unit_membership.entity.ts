import { UnitRole } from "../type/UnitRole";

export class UnitMembership {
  constructor(
    public readonly userId: string,
    public readonly unitId: string,
    public role: UnitRole
  ) {}
}