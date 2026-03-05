import { Address } from "../address/address.entity";
export class Patient {
  constructor(
    public id: string,
    public name: string,
    public address: Address,
    public lastTeamId: string,
    public isPregnant: boolean = false,
    public pregnancyDueDate?: string
  ) {}
}