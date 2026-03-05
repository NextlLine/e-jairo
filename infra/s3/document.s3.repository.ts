import { Document } from '../../domain/document/document.entity';
import { DocumentRepository } from '../../domain/document/document.repository';
import { s3 } from './client';

export class DocumentS3Repository implements DocumentRepository {

  async upload(document: Document) {

    const key = `documents/${document.id}`;

    await s3.putObject({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: document.data,
      ContentType: document.contentType,
    }).promise();
  }

  async delete(documentId: string) {

    const key = `documents/${documentId}`;

    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    }).promise();
  }
}

export const documentS3Repository = new DocumentS3Repository();