import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { HttpError } from "../../../shared/errors/http-error";
import { DocumentService } from "./service";
import { documentS3Repository } from "../../../infra/s3/document.s3.repository";
import { dynamooseDocumentRepository } from "../../../infra/dynamoose/repositories/document.dynamoose.repository";
import { formatHttpErrorResponse } from "../../../shared/errors/format-http-error-response";
import { dynamooseUnitRepository } from "../../../infra/dynamoose/repositories/unit.dynamoose.repository";

const documentService = new DocumentService(
  documentS3Repository,
  dynamooseDocumentRepository,
  dynamooseUnitRepository
);

export async function uploadDocument(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      throw new HttpError(400, "Documento nao fornecido");
    }

    const body = JSON.parse(event.body!);
    await documentService.uploadDocument(body);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Documento cadastrado com sucesso" }),
    };
  } catch (err) {
    return formatHttpErrorResponse(err, "Erro ao realizar cadastro do documento");
  }
}

export async function deleteDocument(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.pathParameters || !event.pathParameters.id) {
      throw new HttpError(400, "ID do documento nao fornecido");
    }

    const documentId = event.pathParameters.id;
    await documentService.deleteDocument(documentId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Documento deletado com sucesso" }),
    };
  } catch (err) {
    return formatHttpErrorResponse(err, "Erro ao deletar documento");
  }
}

export async function getAllDocuments(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.pathParameters || !event.pathParameters.unitId) {
      throw new HttpError(400, "ID da unidade nao fornecido");
    }

    const unitId = event.pathParameters.unitId;

    const documents = await documentService.getAllDocuments(unitId);

    return {
      statusCode: 200,
      body: JSON.stringify({ documents }),
    };
  } catch (err) {
    return formatHttpErrorResponse(err, "Erro ao buscar documentos");
  }
}