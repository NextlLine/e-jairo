import { AppTable } from "../table";
import { Unit } from "../../../domain/unit/unit.entity";
import { UnitRepository } from "../../../domain/unit/unit.repository";
import { Address } from "../../../domain/address/address.entity";

export class UnitDynamooseRepository implements UnitRepository {
  
  async create(unit: Unit): Promise<void> {
    await AppTable.create({
      PK: `UNIT#${unit.id}`,
      SK: "PROFILE",
      entity: "UNIT",

      name: unit.name,
      address: unit.address,

      city: unit.address.city,
      state: unit.address.state,

      GSI1PK: unit.address.toRegionKey(),
      GSI1SK: `UNIT#${unit.id}`,

      GSI2PK: "ENTITY#UNIT",
      GSI2SK: `UNIT#${unit.id}`,
    });
  }

  async findById(id: string): Promise<Unit | null> {
    const item = await AppTable.get({
      PK: `UNIT#${id}`,
      SK: "PROFILE",
    });

    if (!item) return null;

    return new Unit(
      id,
      item.name,
      new Address(
        item.address.street,
        item.address.city,
        item.address.state,
        item.address.zipCode,
        item.address.country
      )
    );
  }

  async listAll(): Promise<Unit[]> {
    const result = await AppTable.query("GSI2PK")
      .eq("ENTITY#UNIT")
      .using("GSI2")
      .exec();

    return result.map((item) =>
      new Unit(
        item.PK.replace("UNIT#", ""),
        item.name,
        new Address(
          item.address.street,
          item.address.city,
          item.address.state,
          item.address.zipCode,
          item.address.country
        )
      )
    );
  }

  async findByRegion(regionKey: string): Promise<Unit[]> {
    const result = await AppTable.query("GSI1PK")
      .eq(regionKey)
      .using("GSI1")
      .exec();

    return result.map((item) =>
      new Unit(
        item.PK.replace("UNIT#", ""),
        item.name,
        new Address(
          item.address.street,
          item.address.city,
          item.address.state,
          item.address.zipCode,
          item.address.country
        )
      )
    );
  }
}

export const dynamooseUnitRepository = new UnitDynamooseRepository();