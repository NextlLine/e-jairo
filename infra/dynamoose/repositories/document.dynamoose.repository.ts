import { DocumentMetadata } from '../../../domain/document/document.metadata.entity';
import { DocumentMetadataRepository } from '../../../domain/document/document.metadata.repository';
class DocumentDynamooseRepository implements DocumentMetadataRepository {
    findAllByUnitId(unitId: string): Promise<Array<DocumentMetadata>> {
        throw new Error('Method not implemented.');
    }
    findById(documentId: string): Promise<DocumentMetadata | null> {
        throw new Error('Method not implemented.');
    }
    create(documentMetadata: DocumentMetadata): Promise<void> {
        throw new Error('Method not implemented.');
    }
    delete(documentId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

export const dynamooseDocumentRepository = new DocumentDynamooseRepository();