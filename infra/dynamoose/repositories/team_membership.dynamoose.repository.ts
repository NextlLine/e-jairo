
import { TeamRole } from "../../../domain/types/TeamRole";
import { AppTable } from "../table";
import { TeamMembershipRepository } from "../../../domain/team_membership/team_membership.repository";
import { TeamMembership } from "../../../domain/team_membership/team_membership.entity";
import dynamoose from "../client";

class TeamMembershipDynamooseRepository implements TeamMembershipRepository {
  toTransactPut(item: TeamMembership) {
    return [
      AppTable.transaction.create({
        PK: `USER#${item.userId}`,
        SK: `TEAM#${item.teamId}`,
        entity: "MEMBERSHIP",
        role: item.role,
      }),
      AppTable.transaction.create({
        PK: `TEAM#${item.teamId}`,
        SK: `USER#${item.userId}`,
        entity: "MEMBERSHIP",
        role: item.role,
      })
    ];
  }

  async findUserMembership(userId: string, teamId: string): Promise<{ userId: string; teamId: string; role: string; } | null> {
    const item = await AppTable.get({
      PK: `USER#${userId}`,
      SK: `TEAM#${teamId}`,
    });

    if (!item) return null;

    return {
      userId,
      teamId,
      role: item.role as string,
    };
  }

  async findByUser(userId: string): Promise<TeamMembership[]> {
    const result = await AppTable.query("PK")
      .eq(`USER#${userId}`)
      .where("entity")
      .eq("MEMBERSHIP")
      .exec();

    return result.map(
      (item) =>
        new TeamMembership(
          userId,
          item.SK.replace("TEAM#", ""),
          item.role as TeamRole
        )
    );
  }
  async findByTeam(teamId: string): Promise<TeamMembership[]> {
    const result = await AppTable.query("PK")
      .eq(`TEAM#${teamId}`)
      .where("entity")
      .eq("MEMBERSHIP")
      .exec();

    return result.map(
      (item) =>
        new TeamMembership(
          item.SK.replace("USER#", ""),
          teamId,
          item.role as TeamRole
        )
    );
  }
  async find(userId: string, teamId: string): Promise<TeamMembership | null> {
    const item = await AppTable.get({
      PK: `USER#${userId}`,
      SK: `TEAM#${teamId}`,
    });

    if (!item) return null;

    return new TeamMembership(userId, teamId, item.role as TeamRole);
  }
  async update(membership: TeamMembership): Promise<void> {
    await AppTable.update(
      {
        PK: `USER#${membership.userId}`,
        SK: `TEAM#${membership.teamId}`,
      },
      {
        role: membership.role,
      }
    );

    await AppTable.update(
      {
        PK: `TEAM#${membership.teamId}`,
        SK: `USER#${membership.userId}`,
      },
      {
        role: membership.role,
      }
    );
  }
  async delete(userId: string, teamId: string): Promise<void> {
    await AppTable.delete({
      PK: `USER#${userId}`,
      SK: `TEAM#${teamId}`,
    });

    await AppTable.delete({
      PK: `TEAM#${teamId}`,
      SK: `USER#${userId}`,
    });
  }

  async create(membership: TeamMembership): Promise<void> {
    await dynamoose.transaction(this.toTransactPut(membership));
  }
}

export const dynamooseTeamMembershipRepository = new TeamMembershipDynamooseRepository();