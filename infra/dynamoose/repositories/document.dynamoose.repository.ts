import { DocumentMetadataRepository } from "../../../domain/document/document.metadata.repository";
import { AppTable } from "../table";
import { DocumentMetadata } from "../../../domain/document/document.metadata.entity";
import { DocQueryResult } from "../../../domain/document/dto/doc_query_result.entity";
import { HttpError } from "../../../shared/errors/http-error";
import normalizeForSearch from "../../../shared/utils/normalize-string";

function encodeCursor(cursor: unknown): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

function decodeCursor(cursor: string): { offset: number; queryKey: string } {
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));

    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.offset !== "number" ||
      typeof decoded.queryKey !== "string"
    ) {
      throw new Error("Invalid cursor payload");
    }

    return decoded;
  } catch {
    throw new HttpError(400, "InvalidCursor");
  }
}

function buildQueryKey(category?: string, name?: string): string {
  return JSON.stringify({
    category: category ?? null,
    name: name ? normalizeForSearch(name) : null,
  });
}

async function fetchAllDocuments(query: any): Promise<DocumentMetadata[]> {
  const items: DocumentMetadata[] = [];
  let lastKey: unknown = undefined;

  do {
    const page = lastKey ? await query.startAt(lastKey).exec() : await query.exec();
    items.push(...page);
    lastKey = page.lastKey;
  } while (lastKey);

  return items;
}

class DocumentDynamooseRepository implements DocumentMetadataRepository {
  async create(document: DocumentMetadata): Promise<void> {
    await AppTable.create({
      PK: `DOCUMENT#${document.id}`,
      SK: `METADATA#${document.id}`,

      entity: "DOCUMENT",

      id: document.id,
      name: document.name,
      nameNormalized: normalizeForSearch(document.name),
      key: document.key,
      contentType: document.contentType,
      size: document.size,
      category: document.category,
      createdAt: document.createdAt,

      GSI2PK: `ENTITY#DOCUMENT`,
      GSI2SK: document.createdAt,
    });
  }

  async findById(id: string): Promise<DocumentMetadata | null> {
    const item = await AppTable.get({
      PK: `DOCUMENT#${id}`,
      SK: `METADATA#${id}`,
    });

    if (!item) return null;

    return new DocumentMetadata(
      item.id,
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
          item.id,
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
    name?: string,
  ): Promise<DocQueryResult> {
    const queryKey = buildQueryKey(category, name);

    let query: any = AppTable.query("GSI2PK").eq("ENTITY#DOCUMENT").using("GSI2");

    if (category) {
      query = query.where("category").eq(category);
    }

    if (name) {
      query = query.where("nameNormalized").contains(normalizeForSearch(name));
    }

    const allResults = await fetchAllDocuments(query);

    const normalizedCursor = cursor ? decodeCursor(cursor) : null;
    const offset = normalizedCursor && normalizedCursor.queryKey === queryKey
      ? normalizedCursor.offset
      : 0;

    const filteredDocuments = allResults.map(
      (item) =>
        new DocumentMetadata(
          item.id,
          item.name,
          item.key,
          item.contentType,
          item.size,
          item.category,
          item.createdAt,
        ),
    );

    const paginatedDocuments = limit
      ? filteredDocuments.slice(offset, offset + limit)
      : filteredDocuments.slice(offset);

    const nextOffset = offset + paginatedDocuments.length;
    const nextCursor = nextOffset < filteredDocuments.length
      ? encodeCursor({ offset: nextOffset, queryKey })
      : null;

    return new DocQueryResult(paginatedDocuments, nextCursor);
  }

  async delete(id: string): Promise<void> {
    await AppTable.delete({
      PK: `DOCUMENT#${id}`,
      SK: `METADATA#${id}`,
    });
  }
}

export const dynamooseDocumentRepository = new DocumentDynamooseRepository();
