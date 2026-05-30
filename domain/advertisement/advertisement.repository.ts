import { Advertisement } from "./advertisement.entity";
export interface AdvertisementRepository {
  create(ad: Advertisement): Promise<void>;
  findById(adId: string): Promise<Advertisement | null>;
  listByTeam(teamId: string): Promise<Advertisement[]>;
  delete(adId: string): Promise<void>;
}