import { Document } from "./document.entity"
export interface DocumentRepository {
  upload(data: Document): Promise<void>;
  delete(documentId: string): Promise<void>;
}