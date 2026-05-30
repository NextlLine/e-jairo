export class DocumentMetadata {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly key: string,
    public readonly contentType: string,
    public readonly size: number,
    public readonly category?: string | null,
    public readonly createdAt: string = new Date().toISOString(),
  ) {}
}
