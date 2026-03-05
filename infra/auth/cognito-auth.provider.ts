import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";

import { AuthProvider } from "./auth.provider";
import { AuthenticationFailedError, CognitoConfigurationError, ConfirmationFailedError, SignUpFailedError } from "./errors";

export class CognitoAuthProvider implements AuthProvider {
  private client: CognitoIdentityProviderClient;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
  }

  async signUp(input: {
    email: string;
    password: string;
  }): Promise<{ userId: string }> {
    if (!process.env.COGNITO_CLIENT_ID) {
      throw new CognitoConfigurationError();
    }

    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: input.email,
      Password: input.password,
      UserAttributes: [
        { Name: "email", Value: input.email },
      ],
    });

    const response = await this.client.send(command);

    if (!response.UserSub) {
      throw new SignUpFailedError();
    }

    return { userId: response.UserSub };
  }

  async confirmCode(input: {
    email: string;
    code: string;
  }) {
    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: input.email,
      ConfirmationCode: input.code,
    });

    const response = await this.client.send(command);

    if (!response) {
      throw new ConfirmationFailedError();
    }

    return { session: response.Session };
  }

  async signIn(input: {
    email: string;
    password: string;
  }) {
    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: input.email,
        PASSWORD: input.password,
      },
      ClientId: process.env.COGNITO_CLIENT_ID!,
    });

    const response = await this.client.send(command);

    if (!response.AuthenticationResult) {
      throw new AuthenticationFailedError();
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken!,
      idToken: response.AuthenticationResult.IdToken!,
      refreshToken: response.AuthenticationResult.RefreshToken,
    };
  }
}