import { DocumentRepository } from '../../../domain/document/document.repository';
import { DocumentMetadataRepository } from '../../../domain/document/document.metadata.repository';
import z from 'zod';
import { UnitRepository } from '../../../domain/unit/unit.repository';
import { HttpError } from '../../../shared/errors/http-error';
import { Document } from '../../../domain/document/document.entity';
import { DocumentMetadata } from '../../../domain/document/document.metadata.entity';
import { randomUUID } from 'crypto';

const UploadDocumentSchema = z.object({
    unitId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    contentType: z.string(),
    size: z.number(),
    data: z.instanceof(Buffer),
    category: z.string().optional(),
});
export class DocumentService {
    constructor(
        private readonly documentRepository: DocumentRepository,
        private readonly documentMetadataRepository: DocumentMetadataRepository,
        private readonly unitRepository: UnitRepository
    ) { }

    async uploadDocument(data: z.infer<typeof UploadDocumentSchema>) {
        const validatedData = UploadDocumentSchema.parse(data);
        const existingUnit = await this.unitRepository.findById(validatedData.unitId);

        if (!existingUnit) {
            throw new HttpError(404, "Unidade não encontrada");
        }

        const id = randomUUID();

        const document = new Document(
            id,
            validatedData.name,
            validatedData.contentType,
            validatedData.size,
            validatedData.data
        );

        try {
            await this.documentRepository.upload(document);

            const metadata = new DocumentMetadata(
                id,
                validatedData.unitId,
                validatedData.name,
                `documents/${id}`,
                validatedData.contentType,
                validatedData.size,
                validatedData.category ?? null
            );

            await this.documentMetadataRepository.create(metadata);

            return metadata;

        } catch (err) {
            try {
                await this.documentRepository.delete(id);
            } catch (err) {
                throw new HttpError(500, "Erro ao limpar documento após falha no upload");
            }
            throw new HttpError(500, "Erro ao upload documento");
        }
    }

    async deleteDocument(documentId: string) {
        try {
            const metadata = await this.documentMetadataRepository
                .findById(documentId);

            if (!metadata) {
                throw new HttpError(404, "Documento não encontrado");
            }

            await this.documentRepository.delete(documentId);

            await this.documentMetadataRepository.delete(documentId);

            return { message: "Documento deletado com sucesso" };

        } catch (err) {
            throw new HttpError(500, "Erro ao deletar documento");
        }
    }

    async getAllDocuments(unitId: string) {
        const existingUnit = await this.unitRepository.findById(unitId);

        if (!existingUnit) {
            throw new HttpError(404, "Unidade não encontrada");
        }

        try {
            const documents = await this.documentMetadataRepository.findAllByUnitId(unitId);

            return documents;

        } catch (err) {
            throw new HttpError(500, "Erro ao buscar documentos");
        }
    }
} 