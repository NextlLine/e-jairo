import { Address } from "../../../domain/address/address.entity";
import { UserRole } from "../../../domain/types/UserRole";
import { User } from "../../../domain/user/user.entity";
import { UserRepository } from "../../../domain/user/user.repository";
import dynamoose from "../client";
import { AppTable } from "../table";

class UserDynamooseRepository implements UserRepository {
  async create(user: User): Promise<void> {
    await dynamoose.transaction(this.toTransactPut(user));
  }

  async findById(id: string): Promise<User | null> {
    const item = await AppTable.get({
      PK: `USER#${id}`,
      SK: "PROFILE",
    });

    if (!item) return null;

    return new User(
      id,
      item.email,
      item.name,
      item.profession,
      UserRole.USER
    );
  }

  async findByRegion(regionKey: string): Promise<User[]> {
    const result = await AppTable.query("GSI1PK")
      .eq(regionKey)
      .using("GSI1")
      .exec();

    return result.map(
      (item) =>
        new User(
          item.PK.replace("USER#", ""),
          item.email,
          item.name,
          item.profession,
          UserRole.USER
        )
    );
  }

  toTransactPut(user: User) {
    return [
      AppTable.transaction.create({
        PK: `USER#${user.id}`,
        SK: "PROFILE",
        entity: "USER",

        name: user.name,
        email: user.email,
        profession: user.profession,

      })
    ];
  }
}

export const dynamooseUserRepository = new UserDynamooseRepository();