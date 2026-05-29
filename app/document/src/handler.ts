import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { HttpError } from "../../../shared/errors/http-error";
import { DocumentService } from "./service";
import { documentS3Repository } from "../../../infra/s3/document.s3.repository";
import { dynamooseDocumentRepository } from "../../../infra/dynamoose/repositories/document.dynamoose.repository";
import { formatHttpErrorResponse } from "../../../shared/errorHandling/format-http-error-response";
import { dynamooseUnitRepository } from "../../../infra/dynamoose/repositories/unit.dynamoose.repository";
import { dynamooseUnitMembershipRepository } from "../../../infra/dynamoose/repositories/unit_membership.dynamoose.repository";
import { getUserSub } from "../../../shared/verification/user-sub";

const documentService = new DocumentService(
  documentS3Repository,
  dynamooseDocumentRepository,
  dynamooseUnitRepository,
  dynamooseUnitMembershipRepository
);

export async function generateUploadUrl(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    throw new HttpError(400, "DocumentNotProvided");
  }

  const body = JSON.parse(event.body!);

  const result = await documentService.generateUploadUrl(body, getUserSub(event));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Upload url gerada com sucesso", data: result }),
  };
} 

export async function saveMetadata(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    throw new HttpError(400, "MetadataNotProvided");
  }

  const body = JSON.parse(event.body!);
  await documentService.saveMetadata(body, getUserSub(event));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Metadata salva com sucesso" }),
  };
}

export async function deleteDocument(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
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

export async function getAllDocuments(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.pathParameters || !event.pathParameters.unitId) {
    throw new HttpError(400, "UnitIdNotProvided");
  }

  const documents = await documentService.getAllDocuments(getUserSub(event));

  return {
    statusCode: 200,
    body: JSON.stringify({ documents }),
  };
}

export async function getDocuments(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.pathParameters || !event.pathParameters.unitId) {
    throw new HttpError(400, "UnitIdNotProvided");
  }

  const unitId = event.pathParameters.unitId;
  const filters = event.queryStringParameters || {};

  const documents = await documentService.getDocuments(unitId, filters);

  return {
    statusCode: 200,
    body: JSON.stringify({ documents }),
  };
}