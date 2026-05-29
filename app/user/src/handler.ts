import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { dynamooseUserRepository } from "../../../infra/dynamoose/repositories/user.dynamoose.repository";
import { UserService } from "./service";
import { HttpError } from "../../../shared/errors/http-error";
import { formatHttpErrorResponse } from "../../../shared/errorHandling/format-http-error-response";

export const userService = new UserService(dynamooseUserRepository);

export async function get(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    if (!event.requestContext.authorizer) {
        throw new HttpError(401, "Unauthorized");
    }

    const userSub = event.requestContext.authorizer.jwt.claims.sub;
    const user = await userService.getUserById(userSub);

    return {
        statusCode: 200,
        body: JSON.stringify(user),
    };
}