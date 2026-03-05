
import { AppTable } from "../table";
import { UnitMembershipRepository } from "../../../domain/unit_membership/unit_membership.repository";
import { UnitMembership } from "../../../domain/unit_membership/unit_membership.entity";
import { UnitRole } from "../../../domain/types/UnitRole";
import dynamoose from "../client";

class UnitMembershipDynamoRepository implements UnitMembershipRepository {

  toTransactPut(item: UnitMembership) {
    return [
      AppTable.transaction.create({
        PK: `USER#${item.userId}`,
        SK: `UNIT#${item.unitId}`,
        entity: "MEMBERSHIP",
        role: item.role,
      }),
      AppTable.transaction.create({
        PK: `UNIT#${item.unitId}`,
        SK: `USER#${item.userId}`,
        entity: "MEMBERSHIP",
        role: item.role,
      })
    ];
  }

  async findUserMembership(userId: string, unitId: string): Promise<{ userId: string; unitId: string; role: string; } | null> {
    const item = await AppTable.get({
      PK: `USER#${userId}`,
      SK: `UNIT#${unitId}`,
    });

    if (!item) return null;

    return {
      userId,
      unitId,
      role: item.role as string,
    };
  }

  async findByUser(userId: string): Promise<UnitMembership[]> {
    const result = await AppTable.query("PK")
      .eq(`USER#${userId}`)
      .where("entity")
      .eq("MEMBERSHIP")
      .exec();

    return result.map(
      (item) =>
        new UnitMembership(
          userId,
          item.SK.replace("UNIT#", ""),
          item.role as UnitRole
        )
    );
  }
  async findByUnit(unitId: string): Promise<UnitMembership[]> {
    const result = await AppTable.query("PK")
      .eq(`UNIT#${unitId}`)
      .where("entity")
      .eq("MEMBERSHIP")
      .exec();

    return result.map(
      (item) =>
        new UnitMembership(
          item.SK.replace("USER#", ""),
          unitId,
          item.role as UnitRole
        )
    );
  }
  async find(userId: string, unitId: string): Promise<UnitMembership | null> {
    const item = await AppTable.get({
      PK: `USER#${userId}`,
      SK: `UNIT#${unitId}`,
    });

    if (!item) return null;

    return new UnitMembership(userId, unitId, item.role as UnitRole);
  }
  async update(membership: UnitMembership): Promise<void> {
    await AppTable.update(
      {
        PK: `USER#${membership.userId}`,
        SK: `UNIT#${membership.unitId}`,
      },
      {
        role: membership.role,
      }
    );

    await AppTable.update(
      {
        PK: `UNIT#${membership.unitId}`,
        SK: `USER#${membership.userId}`,
      },
      {
        role: membership.role,
      }
    );
  }
  async delete(userId: string, unitId: string): Promise<void> {
    await AppTable.delete({
      PK: `USER#${userId}`,
      SK: `UNIT#${unitId}`,
    });

    await AppTable.delete({
      PK: `UNIT#${unitId}`,
      SK: `USER#${userId}`,
    });
  }

  async create(membership: UnitMembership): Promise<void> {
    await dynamoose.transaction(this.toTransactPut(membership));
  }
}

export const dynamooseUnitMembershipRepository = new UnitMembershipDynamoRepository();