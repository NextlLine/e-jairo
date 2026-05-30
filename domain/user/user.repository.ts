import { User } from "./user.entity";
export interface UserRepository {
  create(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByRegion(regionKey: string): Promise<User[]>;
  toTransactPut(item: User): any;
}