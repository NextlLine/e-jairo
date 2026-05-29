import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { TeamService } from "./service";
import { dynamooseTeamRepository } from "../../../infra/dynamoose/repositories/team.dynamoose.repository";
import { dynamooseUnitRepository } from "../../../infra/dynamoose/repositories/unit.dynamoose.repository";
import { HttpError } from "../../../shared/errors/http-error";
import { dynamooseUserRepository } from "../../../infra/dynamoose/repositories/user.dynamoose.repository";
import { formatHttpErrorResponse } from "../../../shared/errorHandling/format-http-error-response";

const teamService = new TeamService(
    dynamooseTeamRepository,
    dynamooseUnitRepository,
    dynamooseUserRepository,
);

export async function create(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    if (!event.body) {
        throw new HttpError(400, "TeamNotProvided");
    }

    if (!event.requestContext.authorizer) {
        throw new HttpError(401, "Unauthorized");
    }

    const body = JSON.parse(event.body!);
    const userSub = event.requestContext.authorizer.jwt.claims.sub;

    const response = await teamService.createTeam(body, userSub);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Time Criado com sucesso", data: response }),
    };
}