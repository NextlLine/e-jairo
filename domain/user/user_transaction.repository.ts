import { User } from "../user/user.entity";
import { TeamMembership } from "../team_membership/team_membership.entity";
import { UnitMembership } from "../unit_membership/unit_membership.entity";

export interface UserTransactionRepository {
  createUserWithMemberships(
    user: User,
    teamMembership: TeamMembership,
    unitMembership: UnitMembership
  ): Promise<void>;
}