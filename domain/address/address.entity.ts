export class Address {
  constructor(
    public street: string,
    public city: string,
    public state: string,
    public zipCode: string,
    public country: string = "Brasil"
  ) {}

  toRegionKey() {
    return `STATE#${this.state.toUpperCase()}#CITY#${this.city.toUpperCase()}`;
  }
}