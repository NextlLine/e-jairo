import { TeamRole } from "../types/TeamRole";

export class TeamMembership {
  constructor(
    public readonly userId: string,
    public readonly teamId: string,
    public role: TeamRole
  ) {}
}