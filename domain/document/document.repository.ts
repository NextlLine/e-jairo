export interface DocumentRepository {
  generatePresignedUrl(id: string, contentType: string): Promise<{uploadUrl: string; key: string }>;
  generatePresignedReadUrl(key: string): Promise<{ viewUrl: string; key: string }>;
  delete(id: string): Promise<void>;
}