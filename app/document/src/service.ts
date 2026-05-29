import { DocumentRepository } from "../../../domain/document/document.repository";
import { DocumentMetadataRepository } from "../../../domain/document/document.metadata.repository";
import { UnitRepository } from "../../../domain/unit/unit.repository";
import { HttpError } from "../../../shared/errors/http-error";
import { DocumentMetadata } from "../../../domain/document/document.metadata.entity";
import { randomUUID } from "crypto";
import z from "zod";
import { UnitMembershipRepository } from "../../../domain/unit_membership/unit_membership.repository";

const GenerateUploadUrlSchema = z.object({
  name: z.string(),
  contentType: z.string(),
});

const UploadDocumentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  contentType: z.string(),
  size: z.number(),
  data: z.instanceof(Buffer),
  category: z.string().optional(),
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
  limit: z.number().optional(),
  cursor: z.number().optional(),
});

export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentMetadataRepository: DocumentMetadataRepository,
    private readonly unitRepository: UnitRepository,
    private readonly unitMembershipRepository: UnitMembershipRepository
  ) { }

  async generateUploadUrl(data: z.infer<typeof GenerateUploadUrlSchema>, userId: string) {
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

  async saveMetadata(data: z.infer<typeof SaveMetadataSchema>, userId: string) {
    const validatedData = SaveMetadataSchema.parse(data);
    const unit = await this.unitMembershipRepository.findByUser(userId);

    if (!unit || unit.length === 0) throw new HttpError(404, "UnitNotFound");

    const metadata = new DocumentMetadata(
      validatedData.documentId,
      unit[0].unitId,
      validatedData.name,
      validatedData.key,
      validatedData.contentType,
      validatedData.size,
      validatedData.category ?? null
    );

    await this.documentMetadataRepository.create(metadata);

    return metadata;
  }

  async deleteDocument(documentId: string) {
    const metadata = await this.documentMetadataRepository.findById(documentId);

    if (!metadata) {
      throw new HttpError(404, "DocumentNotFound");
    }

   
      await this.documentRepository.delete(documentId);

      await this.documentMetadataRepository.delete(documentId);

      return { message: "Documento deletado com sucesso" };
   
  }

  async getAllDocuments(userId: string) {
    const membership = await this.unitMembershipRepository.findByUser(userId);

    if (!membership || membership.length === 0) {
      throw new HttpError(404, "UnitNotFound");
    }

    const unitId = membership[0].unitId; const unit = await this.unitRepository.findById(unitId);

    if (!unit) {
      throw new HttpError(404, "UnitNotFound");
    }

    
      const documents = await this.documentMetadataRepository.findAllByUnitId(unitId);

      return documents;
   
  }

  async getDocuments(unitId: string, query: z.infer<typeof QuerySchema>) {
    const validatedQuery = QuerySchema.parse(query);

    const unit = await this.unitRepository.findById(unitId);

    if (!unit) {
      throw new HttpError(404, "UnitNotFound");
    }

   
      const documents = await this.documentMetadataRepository.findWithFilters(
        unitId,
        validatedQuery.category,
        validatedQuery.limit ? validatedQuery.limit : undefined,
        validatedQuery.cursor ? validatedQuery.cursor : undefined
      );

      return documents;
    
  }
}