import { DocumentMetadata } from "../document.metadata.entity";

export class DocQueryResult {
  constructor(
    public readonly documents: Array<DocumentMetadata>,
    public readonly nextCursor: string | null
  ) {}
}