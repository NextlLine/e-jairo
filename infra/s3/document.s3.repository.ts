import { Document } from '../../domain/document/document.entity';
import { DocumentRepository } from '../../domain/document/document.repository';
import { s3 } from './client';

export class DocumentS3Repository implements DocumentRepository {

  async generatePresignedUrl(id: string, contentType: string): Promise<{ uploadUrl: string; key: string }> {
    const key = `documents/${id}`;

    const url = await s3.getSignedUrlPromise('putObject', {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
      Expires: 60 * 5,
    });

    return {
      uploadUrl: url,
      key
    };
  }

  async generatePresignedReadUrl(key: string): Promise<{ viewUrl: string; key: string }> {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Expires: 60 * 5,
    });

    return {
      viewUrl: url,
      key,
    };
  }

  async upload(document: Document) {
    const key = `documents/${document.id}`;

    await s3.putObject({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: document.data,
      ContentType: document.contentType,
    }).promise();
  }

  async delete(id: string) {
    const key = `documents/${id}`;

    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    }).promise();
  }
}

export const documentS3Repository = new DocumentS3Repository();