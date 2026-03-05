export class Team {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly unitId: string,
    public readonly isActive: boolean = true,
  ) { }
}