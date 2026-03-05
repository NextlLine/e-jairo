import { Advertisement } from "../../../domain/advertisement/advertisement.entity";
import { AdvertisementRepository } from "../../../domain/advertisement/advertisement.repository";
import { AppTable } from "../table";

class AdvertisementDynamooseRepository implements AdvertisementRepository {
  async create(ad: Advertisement): Promise<void> {
    await AppTable.create({
      PK: `TEAM#${ad.teamId}`,
      SK: `ADVERTISEMENT#${ad.id}`,
      entity: "ADVERTISEMENT",

      id: ad.id,
      message: ad.message,
      createdAt: ad.createdAt.toISOString(),

      GSI1PK: `ADVERTISEMENT#${ad.id}`,
      GSI1SK: `TEAM#${ad.teamId}`,
    });
  }

  async findById(adId: string): Promise<Advertisement | null> {
    const result = await AppTable.query("GSI1PK")
      .eq(`ADVERTISEMENT#${adId}`)
      .using("GSI1")
      .exec();

    const item = result[0];
    if (!item) return null;

    return new Advertisement(
      item.id,
      item.message,
      item.PK.replace("TEAM#", ""),
      new Date(item.createdAt)
    );
  }

  async listByTeam(teamId: string): Promise<Advertisement[]> {
    const result = await AppTable.query("PK")
      .eq(`TEAM#${teamId}`)
      .where("entity")
      .eq("ADVERTISEMENT")
      .exec();

    return result.map(
      (item) =>
        new Advertisement(
          item.id,
          item.message,
          teamId,
          new Date(item.createdAt)
        )
    );
  }

  async delete(adId: string): Promise<void> {
    const ad = await this.findById(adId);
    if (!ad) return;

    await AppTable.delete({
      PK: `TEAM#${ad.teamId}`,
      SK: `ADVERTISEMENT#${ad.id}`,
    });
  }

}

export const dynamooseAdvertisementRepository = new AdvertisementDynamooseRepository();