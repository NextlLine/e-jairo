import { DocumentRepository } from "../../../domain/document/document.repository";
import { DocumentMetadataRepository } from "../../../domain/document/document.metadata.repository";
import { HttpError } from "../../../shared/errors/http-error";
import { DocumentMetadata } from "../../../domain/document/document.metadata.entity";
import { randomUUID } from "crypto";
import z from "zod";
import { UserRepository } from "../../../domain/user/user.repository";
import { UserRole } from "../../../domain/type/UserRole";
import { verifyUserRole } from "../../../shared/verification/verifyUserRole";

const GenerateUploadUrlSchema = z.object({
  name: z.string(),
  contentType: z.string(),
});

const GenerateViewUrlSchema = z.object({
  documentId: z.string(),
});

const SaveMetadataSchema = z.object({
  documentId: z.string(),
  name: z.string(),
  key: z.string(),
  contentType: z.string(),
  size: z.number(),
  category: z.string().optional(),
});

const QuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
  cursor: z.string().optional(),
});

export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentMetadataRepository: DocumentMetadataRepository,
    private readonly userRepository: UserRepository,
  ) { }

  async generateUploadUrl(data: z.infer<typeof GenerateUploadUrlSchema>, userSub: string) {
    await verifyUserRole(userSub, [UserRole.ADMIN, UserRole.MASTER], this.userRepository);

    const validatedData = GenerateUploadUrlSchema.parse(data);
    const documentId = randomUUID();

    const { uploadUrl, key } =
      await this.documentRepository.generatePresignedUrl(documentId, validatedData.contentType);

    return {
      documentId,
      uploadUrl,
      key
    };
  }

  async saveMetadata(data: z.infer<typeof SaveMetadataSchema>, userSub: string) {
    await verifyUserRole(userSub, [UserRole.ADMIN, UserRole.MASTER], this.userRepository);

    const validatedData = SaveMetadataSchema.parse(data);
    const metadata = new DocumentMetadata(
      validatedData.documentId,
      validatedData.name,
      validatedData.key,
      validatedData.contentType,
      validatedData.size,
      validatedData.category ?? null
    );

    await this.documentMetadataRepository.create(metadata);

    return metadata;
  }

  async generateViewUrl(data: z.infer<typeof GenerateViewUrlSchema>) {
    const validatedData = GenerateViewUrlSchema.parse(data);
    const metadata = await this.documentMetadataRepository.findById(validatedData.documentId);

    if (!metadata) {
      throw new HttpError(404, "DocumentNotFound");
    }

    const { viewUrl, key } = await this.documentRepository.generatePresignedReadUrl(metadata.key);

    return {
      documentId: validatedData.documentId,
      viewUrl,
      key,
    };
  }

  async deleteDocument(documentId: string, userSub: string) {
    await verifyUserRole(userSub, [UserRole.ADMIN, UserRole.MASTER], this.userRepository);

    const metadata = await this.documentMetadataRepository.findById(documentId);

    if (!metadata) {
      throw new HttpError(404, "DocumentNotFound");
    }
   
      await this.documentRepository.delete(documentId);

      await this.documentMetadataRepository.delete(documentId);

    return { message: "Documento deletado com sucesso" };
  }

  async getDocuments(query: z.infer<typeof QuerySchema>) {
    const validatedQuery = QuerySchema.parse(query);

    const documents = await this.documentMetadataRepository.findWithFilters(
      validatedQuery.category ?? undefined,
      validatedQuery.limit ?? undefined,
      validatedQuery.cursor ?? undefined
    );

    return documents;
  }
}