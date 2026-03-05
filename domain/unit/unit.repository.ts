import { Unit } from "./unit.entity";

export interface UnitRepository {
  create(unit: Unit): Promise<void>;
  findById(id: string): Promise<Unit | null>;
  listAll(): Promise<Unit[]>;
  findByRegion(regionKey: string): Promise<Unit[]>;
}