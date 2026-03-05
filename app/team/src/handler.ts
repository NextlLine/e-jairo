import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { TeamService } from "./service";
import { dynamooseTeamRepository } from "../../../infra/dynamoose/repositories/team.dynamoose.repository";
import { dynamooseUnitRepository } from "../../../infra/dynamoose/repositories/unit.dynamoose.repository";
import { HttpError } from "../../../shared/errors/http-error";
import { dynamooseUserRepository } from "../../../infra/dynamoose/repositories/user.dynamoose.repository";
import { formatHttpErrorResponse } from "../../../shared/errors/format-http-error-response";

const teamService = new TeamService(
    dynamooseTeamRepository,
    dynamooseUnitRepository,
    dynamooseUserRepository,
);

export async function create(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        if (!event.body) {
            throw new HttpError(400, "Time nao fornecido");
        }

        if (!event.requestContext.authorizer) {
            throw new HttpError(401, "Não autorizado");
        }

        const body = JSON.parse(event.body!);
        const userSub = event.requestContext.authorizer.jwt.claims.sub;

        const response = await teamService.createTeam(body, userSub);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Time Criado com sucesso", data: response }),
        };
    } catch (err: any) {
        return formatHttpErrorResponse(err, "Erro ao criar time");
    }
}