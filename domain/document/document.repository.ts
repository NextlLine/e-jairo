export interface DocumentRepository {
  generatePresignedUrl(documentId: string, contentType: string): Promise<{uploadUrl: string; key: string }>;
  generatePresignedReadUrl(key: string): Promise<{ viewUrl: string; key: string }>;
  delete(documentId: string): Promise<void>;
}