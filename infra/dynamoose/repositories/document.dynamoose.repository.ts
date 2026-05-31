import { DocumentMetadataRepository } from "../../../domain/document/document.metadata.repository";
import { AppTable } from "../table";
import { DocumentMetadata } from "../../../domain/document/document.metadata.entity";
import { DocQueryResult } from "../../../domain/document/dto/doc_query_result.entity";

function encodeCursor(cursor: unknown): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

function decodeCursor(cursor: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
  } catch {
    throw new Error("InvalidCursor");
  }
}

class DocumentDynamooseRepository implements DocumentMetadataRepository {
  async create(document: DocumentMetadata): Promise<void> {
    await AppTable.create({
      PK: `DOCUMENT#${document.id}`,
      SK: `METADATA#${document.id}`,

      entity: "DOCUMENT",

      documentId: document.id,
      name: document.name,
      key: document.key,
      contentType: document.contentType,
      size: document.size,
      category: document.category,
      createdAt: document.createdAt,
    });
  }

  async findById(documentId: string): Promise<DocumentMetadata | null> {
    const item = await AppTable.get({
      PK: `DOCUMENT#${documentId}`,
      SK: `METADATA#${documentId}`,
    });

    if (!item) return null;

    return new DocumentMetadata(
      item.documentId,
      item.name,
      item.key,
      item.contentType,
      item.size,
      item.category,
      item.createdAt,
    );
  }

  async findAll(): Promise<DocumentMetadata[]> {
    const result = await AppTable.scan("entity").eq("DOCUMENT").exec();

    return result.map(
      (item) =>
        new DocumentMetadata(
          item.documentId,
          item.name,
          item.key,
          item.contentType,
          item.size,
          item.category,
          item.createdAt,
        ),
    );
  }

  async findWithFilters(
    category?: string,
    limit?: number,
    cursor?: string,
  ): Promise<DocQueryResult> {
    let scanner: any = AppTable.scan("entity").eq("DOCUMENT");

    if (category) {
      scanner = scanner.where("category").eq(category);
    }

    if (cursor) {
      scanner = scanner.startAt(decodeCursor(cursor));
    }

    if (limit) {
      scanner = scanner.limit(limit);
    }

    const result = await scanner.exec();

    const documents = result.map((item: DocumentMetadata) => {
      return new DocumentMetadata(
        item.documentId,
        item.name,
        item.key,
        item.contentType,
        item.size,
        item.category,
        item.createdAt,
      );
    });

    const nextCursor = result.lastKey ? encodeCursor(result.lastKey) : null;

    return new DocQueryResult(documents, nextCursor);
  }

  async delete(documentId: string): Promise<void> {
    await AppTable.delete({
      PK: `DOCUMENT#${documentId}`,
      SK: `METADATA#${documentId}`,
    });
  }
}

export const dynamooseDocumentRepository = new DocumentDynamooseRepository();
