import { randomUUID } from "crypto";
import { HttpError } from "../../../shared/errors/http-error";
import { Advertisement } from "../../../domain/advertisement/advertisement.entity";
import { AdvertisementRepository } from "../../../domain/advertisement/advertisement.repository";
import { TeamMembershipRepository } from "../../../domain/team_membership/team_membership.repository";

export class AdvertisementService {
  constructor(
    private readonly advertisementRepository: AdvertisementRepository,
    private readonly teamMembershipRepository: TeamMembershipRepository
  ) {}

  async create(data: {
    message: string;
    userId: string;
    teamId: string;
  }) {
    if (!data.message || data.message.trim().length === 0) {
      throw new HttpError(400, "Mensagem inválida");
    }

    const membership =
      await this.teamMembershipRepository.find(
        data.userId,
        data.teamId
      );

    if (!membership) {
      throw new HttpError(403, "Usuário não pertence a este time");
    }

    const ad = new Advertisement(
      randomUUID(),
      data.message,
      data.teamId
    );

    await this.advertisementRepository.create(ad);
  }

  async list(teamId: string, userId: string) {
    const membership =
      await this.teamMembershipRepository.find(
        userId,
        teamId
      );

    if (!membership) {
      throw new HttpError(403, "Usuário não pertence a este time");
    }

    return this.advertisementRepository.listByTeam(teamId);
  }

  async delete(adId: string, userId: string) {
    const ad = await this.advertisementRepository.findById(adId);

    if (!ad) {
      throw new HttpError(404, "Anúncio não encontrado");
    }

    const membership =
      await this.teamMembershipRepository.find(
        userId,
        ad.teamId
      );

    if (!membership) {
      throw new HttpError(403, "Usuário não pertence a este time");
    }

    if (membership.role !== "ADMIN") {
      throw new HttpError(403, "Apenas administradores podem deletar anúncios");
    }

    await this.advertisementRepository.delete(adId);
  }
}