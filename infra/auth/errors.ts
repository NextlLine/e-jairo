export class CognitoConfigurationError extends Error {
  constructor() {
    super("Cognito não configurado corretamente");
  }
}

export class SignUpFailedError extends Error {
  constructor() {
    super("Falha ao registrar usuário");
  }
}

export class ConfirmationFailedError extends Error {
  constructor(message = "Falha ao confirmar código") {
    super(message);
  }
}

export class AuthenticationFailedError extends Error {
  constructor(message = "Credenciais inválidas") {
    super(message);
  }
}