export class Advertisement {
  constructor(
    public id: string,
    public message: string,
    public teamId: string,
    public readonly createdAt: Date = new Date()
  ) {}
}