import { DocumentMetadataRepository } from "../../../domain/document/document.metadata.repository";
import { AppTable } from "../table";
import { DocumentMetadata } from "../../../domain/document/document.metadata.entity";
import { DocQueryResult } from "../../../domain/document/dto/doc_query_result.entity";

class DocumentDynamooseRepository implements DocumentMetadataRepository {
  findWithFilters(unitId: string, category?: string, limit?: number, cursor?: number): Promise<DocQueryResult> {
      throw new Error("Method not implemented.");
  }

  async create(document: DocumentMetadata): Promise<void> {

    await AppTable.create({
      PK: `UNIT#${document.unitId}`,
      SK: `DOCUMENT#${document.id}`,

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

    const result = await AppTable.query("SK")
      .eq(`DOCUMENT#${documentId}`)
      .using("GSI2")
      .exec();

    if (!result.count) return null;

    const item = result[0];

    return new DocumentMetadata(
      item.documentId,
      item.PK.replace("UNIT#", ""),
      item.name,
      item.key,
      item.contentType,
      item.size,
      item.category
    );
  }

  async findAllByUnitId(unitId: string): Promise<DocumentMetadata[]> {

    const result = await AppTable.query("PK")
      .eq(`UNIT#${unitId}`)
      .where("SK")
      .beginsWith("DOCUMENT#")
      .exec();

    return result.map(item =>
      new DocumentMetadata(
        item.documentId,
        unitId,
        item.name,
        item.key,
        item.contentType,
        item.size,
        item.category
      )
    );
  }

  async delete(documentId: string): Promise<void> {

    const metadata = await this.findById(documentId);
    if (!metadata) return;

    await AppTable.delete({
      PK: `UNIT#${metadata.unitId}`,
      SK: `DOCUMENT#${documentId}`
    });
  }
}

export const dynamooseDocumentRepository = new DocumentDynamooseRepository();