import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { HttpError } from "../../../shared/errors/http-error";
import { DocumentService } from "./service";
import { documentS3Repository } from "../../../infra/s3/document.s3.repository";
import { dynamooseDocumentRepository } from "../../../infra/dynamoose/repositories/document.dynamoose.repository";
import { getUserSub } from "../../../shared/verification/user-sub";
import { DocumentMetadata } from "../../../domain/document/document.metadata.entity";

const documentService = new DocumentService(
  documentS3Repository,
  dynamooseDocumentRepository,
);

export async function generateUploadUrl(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    throw new HttpError(400, "DocumentNotProvided");
  }

  const body = JSON.parse(event.body!);

  const result = await documentService.generateUploadUrl(body);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Upload url gerada com sucesso",
      data: result,
    }),
  };
}

export async function saveMetadata(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    throw new HttpError(400, "MetadataNotProvided");
  }

  const body = JSON.parse(event.body!);
  await documentService.saveMetadata(body);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Metadata salva com sucesso" }),
  };
}

export async function generateViewUrl(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    throw new HttpError(400, "DocumentIdNotProvided");
  }

  const body = JSON.parse(event.body!);

  const result = await documentService.generateViewUrl(body);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Upload url de visualizacao gerada com sucesso",
      data: result,
    }),
  };
}

export async function deleteDocument(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  if (!event.pathParameters || !event.pathParameters.id) {
    throw new HttpError(400, "DocumentIdNotProvided");
  }

  const documentId = event.pathParameters.id;
  await documentService.deleteDocument(documentId);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Documento deletado com sucesso" }),
  };
}

export async function getDocuments(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const filters = event.queryStringParameters || {};

  const { documents } = await documentService.getDocuments(filters as any);
  const responseData = documents.map((document) => ({
    id: document.id,
    nome: document.name,
    arquivo: document.key,
    name: document.name,
    key: document.key,
    contentType: document.contentType,
    size: document.size,
    category: document.category,
    createdAt: document.createdAt,
  }));
  
  return {
    statusCode: 200,
    body: JSON.stringify(responseData),
  };
}

