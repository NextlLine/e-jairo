import { DocumentMetadata } from "./document.metadata.entity";
export interface DocumentMetadataRepository {
    create(documentMetadata: DocumentMetadata): Promise<void>;
    delete(documentId: string): Promise<void>;
    findAllByUnitId(unitId: string): Promise<Array<DocumentMetadata>>;
    findById(documentId: string):Promise<DocumentMetadata | null>;
}