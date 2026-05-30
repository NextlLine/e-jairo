import { TeamMembership } from "./team_membership.entity";

export interface TeamMembershipRepository {
  create(membership: TeamMembership): Promise<void>;
  findByUser(userId: string): Promise<TeamMembership[]>;
  findByTeam(teamId: string): Promise<TeamMembership[]>;
  find(userId: string, teamId: string): Promise<TeamMembership | null>;
  update(membership: TeamMembership): Promise<void>;
  delete(userId: string, teamId: string): Promise<void>;
  toTransactPut(item: TeamMembership): any;
}