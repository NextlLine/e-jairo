import { randomUUID } from "crypto";
import { HttpError } from "../../../shared/errors/http-error";
import { Advertisement } from "../../../domain/advertisement/advertisement.entity";
import { AdvertisementRepository } from "../../../domain/advertisement/advertisement.repository";
import { TeamMembershipRepository } from "../../../domain/team_membership/team_membership.repository";
import z from "zod";

const createAdSchema = z.object({
  message: z.string().min(1),
});
export class AdvertisementService {
  constructor(
    private readonly advertisementRepository: AdvertisementRepository,
    private readonly teamMembershipRepository: TeamMembershipRepository
  ) {}

  async create(data: z.infer<typeof createAdSchema>, userId: string) {
    const validatedData = createAdSchema.parse(data);

    if (!validatedData.message || validatedData.message.trim().length === 0) {
      throw new HttpError(400, "AdvertisementMessageInvalid");
    }

    const membership = await this.teamMembershipRepository.findByUser(userId)

    if (!membership) {
      throw new HttpError(403, "UserNotInTeam");
    }

    const ad = new Advertisement(
      randomUUID(),
      data.message,
      membership[0].teamId
    );

    await this.advertisementRepository.create(ad);
  }

  async list(userId: string) {
    const membership = await this.teamMembershipRepository.findByUser(userId)


    if (!membership) {
      throw new HttpError(403, "UserNotInTeam");
    }

    return this.advertisementRepository.listByTeam(membership[0].teamId);
  }

  async delete(adId: string, userId: string) {
    const ad = await this.advertisementRepository.findById(adId);

    if (!ad) {
      throw new HttpError(404, "AdvertisementNotFound");
    }

    const membership =
      await this.teamMembershipRepository.find(
        userId,
        ad.teamId
      );

    if (!membership) {
      throw new HttpError(403, "UserNotInTeam");
    }

    await this.advertisementRepository.delete(adId);
  }
}