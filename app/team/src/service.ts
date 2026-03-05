import z from "zod";
import { TeamRepository } from "../../../domain/team/team.repository";
import { UnitRepository } from "../../../domain/unit/unit.repository";
import { Team } from "../../../domain/team/team.entity";
import { randomUUID } from "crypto";
import { HttpError } from "../../../shared/errors/http-error";
import { TeamRole } from "../../../domain/types/TeamRole";
import { UserRepository } from "../../../domain/user/user.repository";
import { verifyUserRole } from "../../../shared/verifyUserRole";

const CreateTeamSchema = z.object({
  name: z.string().min(3).max(50),
  unitId: z.string().uuid(),
});

export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository, 
    private readonly unitRepository: UnitRepository, 
    private readonly userRepository: UserRepository,
  ) { }

  async createTeam(teamData: z.infer<typeof CreateTeamSchema>, userSub: string) {    
    const validatedData = CreateTeamSchema.parse(teamData);

    const existingUnit = await this.unitRepository.findById(validatedData.unitId);
    if (!existingUnit) {
      throw new HttpError(404, "Unidade não encontrada");
    }

    await verifyUserRole(userSub, [TeamRole.ADMIN], this.userRepository);

    const team = new Team(
      randomUUID(),
      validatedData.name,
      validatedData.unitId,
    );

    try {
      await this.teamRepository.create(team);
        
      return team;

    } catch (error) {
      throw new HttpError(500, "Erro ao criar time");
    }
  }
}