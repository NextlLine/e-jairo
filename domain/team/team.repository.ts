import { Team } from "./team.entity";

export interface TeamRepository {
  create(team: Team): Promise<Team>;
  findById(teamId: string): Promise<Team | null>;
  listByUnit(unitId: string): Promise<Team[]>;
  update(teamId: string, data: Partial<Team>): Promise<Team>;
  toTransactPut(team: Team): any;
}