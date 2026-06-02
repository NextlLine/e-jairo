import { DocumentMetadata } from "./document.metadata.entity";
import { DocQueryResult } from "./dto/doc_query_result.entity";
export interface DocumentMetadataRepository {
    create(documentMetadata: DocumentMetadata): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string):Promise<DocumentMetadata | null>;
    findWithFilters(category?: string, limit?: number, cursor?: string, name?: string): Promise<DocQueryResult>;
}