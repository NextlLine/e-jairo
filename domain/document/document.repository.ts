import { Document } from "./document.entity"
export interface DocumentRepository {
  generatePresignedUrl(documentId: string, contentType: string): Promise<{uploadUrl: string; key: string }>;
  delete(documentId: string): Promise<void>;
}