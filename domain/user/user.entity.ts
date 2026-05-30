import { Profession } from "../type/Profession";
import { UserRole } from "../type/UserRole";
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public name: string,
    public profession: Profession,
    public role: UserRole
  ) {}
}