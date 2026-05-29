import { APIGatewayProxyEvent } from "aws-lambda";
import { HttpError } from "./../errors/http-error";

export function getUserSub(event: APIGatewayProxyEvent): string {
  if (!event.requestContext.authorizer) {
    throw new HttpError(401, "Unauthorized");
  }
  return event.requestContext.authorizer.jwt.claims.sub;
}