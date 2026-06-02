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
  id: z.string(),
});

const SaveMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  contentType: z.string(),
  size: z.number(),
  category: z.string().optional(),
});

const QuerySchema = z.object({
  category: z.string().optional(),
  name: z.string().optional(),
  q: z.string().optional(),
  qType: z.enum(["name", "category"]).optional(),
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
    const id = randomUUID();

    const { uploadUrl, key } =
      await this.documentRepository.generatePresignedUrl(id, validatedData.contentType);

    return {
      id,
      uploadUrl,
      key
    };
  }

  async saveMetadata(data: z.infer<typeof SaveMetadataSchema>, userSub: string) {
    await verifyUserRole(userSub, [UserRole.ADMIN, UserRole.MASTER], this.userRepository);

    const validatedData = SaveMetadataSchema.parse(data);
    const metadata = new DocumentMetadata(
      validatedData.id,
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
    const metadata = await this.documentMetadataRepository.findById(validatedData.id);

    if (!metadata) {
      throw new HttpError(404, "DocumentNotFound");
    }

    const { viewUrl, key } = await this.documentRepository.generatePresignedReadUrl(metadata.key);

    return {
      id: validatedData.id,
      viewUrl,
      key,
    };
  }

  async deleteDocument(id: string, userSub: string) {
    await verifyUserRole(userSub, [UserRole.ADMIN, UserRole.MASTER], this.userRepository);

    const metadata = await this.documentMetadataRepository.findById(id);

    if (!metadata) {
      throw new HttpError(404, "DocumentNotFound");
    }
   
      await this.documentRepository.delete(id);

      await this.documentMetadataRepository.delete(id);

    return { message: "Documento deletado com sucesso" };
  }

  async getDocuments(query: z.infer<typeof QuerySchema>) {
    const validatedQuery = QuerySchema.parse(query);

    let category = validatedQuery.category;
    let name = validatedQuery.name;

    if (validatedQuery.q && validatedQuery.qType) {
      if (validatedQuery.qType === "name") name = validatedQuery.q;
      if (validatedQuery.qType === "category") category = validatedQuery.q;
    }

    const documents = await this.documentMetadataRepository.findWithFilters(
      category ?? undefined,
      validatedQuery.limit ?? undefined,
      validatedQuery.cursor ?? undefined,
      name ?? undefined,
    );

    return documents;
  }
}