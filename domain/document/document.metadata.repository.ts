import { DocumentMetadata } from "./document.metadata.entity";
import { DocQueryResult } from "./dto/doc_query_result.entity";
export interface DocumentMetadataRepository {
    create(documentMetadata: DocumentMetadata): Promise<void>;
    delete(documentId: string): Promise<void>;
    findById(documentId: string):Promise<DocumentMetadata | null>;
    findWithFilters(category?: string, limit?: number, cursor?: number): Promise<DocQueryResult>;
}