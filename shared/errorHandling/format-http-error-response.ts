import { APIGatewayProxyResult } from "aws-lambda";
import { ZodError } from "zod";
import { HttpError } from "../errors/http-error";
import { UserNotConfirmedException } from "@aws-sdk/client-cognito-identity-provider";
import {
  AuthenticationFailedError,
  CognitoConfigurationError,
  ConfirmationFailedError,
  SignUpFailedError,
} from "../../infra/auth/errors";

export function formatHttpErrorResponse(
  err: any,
  fallbackMessage = "InternalServerError",
): APIGatewayProxyResult {
  console.error("HTTP Error:", err);

  if (err instanceof ZodError) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "ValidationError",
        errors: err.issues,
      }),
    };
  }

  if (err instanceof HttpError) {
    return {
      statusCode: err.statusCode,
      body: JSON.stringify({ message: err.message }),
    };
  }

  if (err instanceof UserNotConfirmedException) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "UserNotConfirmedException" }),
    };
  }

   if (err instanceof CognitoConfigurationError) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "CognitoConfigurationError" }),
    };
  }

  if (err instanceof SignUpFailedError) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "SignUpFailedError" }),
    };
  }

  if (err instanceof ConfirmationFailedError) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "ConfirmationFailedError" }),
    };
  }

  if (err instanceof AuthenticationFailedError) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "AuthenticationFailedError" }),
    };
  }

  return {
    statusCode: 500,
    body: JSON.stringify({ message: fallbackMessage }),
  };
} 
