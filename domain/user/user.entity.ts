import { Profession } from "../types/profession";
import { UserRole } from "../types/UserRole";
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public name: string,
    public profession: Profession,
    public role: UserRole
  ) {}
}