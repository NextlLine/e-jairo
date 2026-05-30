import { Address } from "../address/address.entity";
export class Unit {
  constructor(
    public id: string,
    public name: string,
    public address: Address
  ) {}
}