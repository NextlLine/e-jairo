import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { HttpError } from "../../../shared/errors/http-error";
import { formatHttpErrorResponse } from "../../../shared/errors/format-http-error-response";
import { AuthService } from "./service";
import { dynamooseUserRepository } from "../../../infra/dynamoose/repositories/user.dynamoose.repository";
import { CognitoAuthProvider } from "../../../infra/auth/cognito-auth.provider";
import { dynamooseTeamRepository } from "../../../infra/dynamoose/repositories/team.dynamoose.repository";
import { dynamooseTeamMembershipRepository } from "../../../infra/dynamoose/repositories/team_membership.dynamoose.repository";
import { dynamooseUnitMembershipRepository } from "../../../infra/dynamoose/repositories/unit_membership.dynamoose.repository";
import { dynamooseUserTransactionRepository } from "../../../infra/dynamoose/transactions/user_transaction.dynamoose.repository";

const authProvider = new CognitoAuthProvider();

const authService = new AuthService(
  authProvider,
  dynamooseTeamRepository,
  dynamooseUserTransactionRepository
);

export async function signUp(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      throw new HttpError(400, "Usuário não fornecido");
    }

    const body = JSON.parse(event.body);
    await authService.signUp(body);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Usuário cadastrado com sucesso",
      }),
    };
  } catch (err: any) {
    return formatHttpErrorResponse(err, "Erro ao realizar cadastro");
  }
}

export async function confirmCode(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      throw new HttpError(400, "Usuário não fornecido");
    }

    const body = JSON.parse(event.body);
    const response = await authService.confirmCode(body);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    return formatHttpErrorResponse(err,"Erro ao confirmar código");
  }
}

export async function signIn(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      throw new HttpError(400, "Usuário não fornecido");
    }

    const body = JSON.parse(event.body);
    const response = await authService.signIn(body);

    return {
      statusCode: 200,
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify(response),
    };
  } catch (err) {
    return formatHttpErrorResponse(err,"Erro ao realizar login");
  }
}