import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import { HttpError } from "../../../shared/errors/http-error";
import { formatHttpErrorResponse } from "../../../shared/errorHandling/format-http-error-response";
import { dynamooseAdvertisementRepository } from "../../../infra/dynamoose/repositories/advertisement.dynamoose.repository";
import { dynamooseTeamMembershipRepository } from "../../../infra/dynamoose/repositories/team_membership.dynamoose.repository";
import { AdvertisementService } from "./service";
import { getUserSub } from "../../../shared/verification/user-sub";

const advertisementService = new AdvertisementService(
    dynamooseAdvertisementRepository,
    dynamooseTeamMembershipRepository
);

export async function create(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    const body = event.body ? JSON.parse(event.body) : null;

    if (!body.message) {
        throw new HttpError(400, "AdvertisementMessageNotProvided");
    }

    await advertisementService.create(body, getUserSub(event));

    return {
        statusCode: 201,
        body: JSON.stringify({ message: "Anúncio criado com sucesso" }),
    };
}

export async function list(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    const ads = await advertisementService.list(getUserSub(event));

    return {
        statusCode: 200,
        body: JSON.stringify(ads),
    };
}

export async function deleteById(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {

    const adId = event.pathParameters?.id;

    if (!adId) {
        throw new HttpError(400, "AdvertisementIdNotProvided");
    }

    await advertisementService.delete(adId, getUserSub(event));

    return {
        statusCode: 204,
        body: "",
    };
}