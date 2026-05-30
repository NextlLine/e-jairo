import { Team } from "../../../domain/team/team.entity";
import { TeamRepository } from "../../../domain/team/team.repository";
import dynamoose from "../client";
import { AppTable } from "../table";

class TeamDynamooseRepository implements TeamRepository {
  toTransactPut(team: Team) {
    return [
      AppTable.transaction.create({
      PK: `TEAM#${team.id}`,
      SK: "PROFILE",

      GSI2PK: `UNIT#${team.unitId}`,
      GSI2SK: `TEAM#${team.id}`,

      entity: "TEAM",

      ...team,
    })
    ]
  }

  async create(team: Team): Promise<Team> {
    await dynamoose.transaction(this.toTransactPut(team));

    return team;
  }

  async update(teamId: string, data: Partial<Team>): Promise<Team> {
    const updated = await AppTable.update(
      { PK: `TEAM#${teamId}`, SK: "PROFILE" },
      data,
    );

    return new Team(
      updated.id,
      updated.name,
      updated.unitId,
      updated.isActive ?? true,
    );
  }

  async findById(teamId: string): Promise<Team | null> {
    const item = await AppTable.get({
      PK: `TEAM#${teamId}`,
      SK: "PROFILE",
    });

    if (!item) return null;

    return new Team(
      item.id,
      item.name,
      item.unitId,
      item.isActive ?? true,
    );
  }

  async listByUnit(unitId: string): Promise<Team[]> {
    const items = await AppTable.query("GSI2PK")
      .eq(`UNIT#${unitId}`)
      .using("GSI2")
      .exec();

    return items.map((item: any) => new Team(
      item.id,
      item.name,
      item.unitId,
      item.isActive ?? true,
    ));
  }
}

export const dynamooseTeamRepository = new TeamDynamooseRepository();