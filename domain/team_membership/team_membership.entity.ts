import { TeamRole } from "../type/TeamRole";

export class TeamMembership {
  constructor(
    public readonly userId: string,
    public readonly teamId: string,
    public role: TeamRole
  ) {}
}