import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import { HttpError } from "../../../shared/errors/http-error";
import { formatHttpErrorResponse } from "../../../shared/errors/format-http-error-response";
import { dynamooseAdvertisementRepository } from "../../../infra/dynamoose/repositories/advertisement.dynamoose.repository";
import { dynamooseTeamMembershipRepository } from "../../../infra/dynamoose/repositories/team_membership.dynamoose.repository";
import { AdvertisementService } from "./service";

const advertisementService = new AdvertisementService(
    dynamooseAdvertisementRepository,
    dynamooseTeamMembershipRepository
);

function getUserId(event: APIGatewayProxyEvent): string {
    if (!event.requestContext.authorizer) {
        throw new HttpError(401, "Não autorizado");
    }

    return event.requestContext.authorizer.jwt.claims.sub;
}

function parseBody(event: APIGatewayProxyEvent) {
    if (!event.body) {
        throw new HttpError(400, "Body não fornecido");
    }

    return JSON.parse(event.body);
}

export async function create(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserId(event);
        const body = parseBody(event);

        if (!body.message) {
            throw new HttpError(400, "Mensagem não fornecida");
        }

        if (!body.teamId) {
            throw new HttpError(400, "teamId não fornecido");
        }

        await advertisementService.create({
            message: body.message,
            userId,
            teamId: body.teamId,
        });

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Anúncio criado com sucesso" }),
        };
    } catch (err) {
        return formatHttpErrorResponse(err, "Erro ao criar anúncio");
    }
}


export async function list(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserId(event);

        const teamId = event.queryStringParameters?.teamId;

        if (!teamId) {
            throw new HttpError(400, "teamId não fornecido");
        }

        const ads = await advertisementService.list(teamId, userId);

        return {
            statusCode: 200,
            body: JSON.stringify(ads),
        };
    } catch (err) {
        return formatHttpErrorResponse(err, "Erro ao listar anúncios");
    }
}

export async function deleteById(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserId(event);

        const adId = event.pathParameters?.id;

        if (!adId) {
            throw new HttpError(400, "ID não fornecido");
        }

        await advertisementService.delete(adId, userId);

        return {
            statusCode: 204,
            body: "",
        };
    } catch (err) {
        return formatHttpErrorResponse(err, "Erro ao deletar anúncio");
    }
}