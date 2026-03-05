import { UnitMembership } from "./unit_membership.entity";

export interface UnitMembershipRepository {
  create(membership: UnitMembership): Promise<void>;
  findByUser(userId: string): Promise<UnitMembership[]>;
  findByUnit(unitId: string): Promise<UnitMembership[]>;
  find(userId: string, unitId: string): Promise<UnitMembership | null>;
  update(membership: UnitMembership): Promise<void>;
  delete(userId: string, unitId: string): Promise<void>;
  toTransactPut(item: UnitMembership): any;
}