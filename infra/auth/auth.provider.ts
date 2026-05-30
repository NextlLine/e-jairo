export interface AuthProvider {
  signUp(input: {
    email: string;
    password: string;
  }): Promise<{ userId: string }>;

  confirmCode(input: {
    email: string;
    code: string;
  }): Promise<{ session?: string }>;

  signIn(input: {
    email: string;
    password: string;
  }): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken?: string;
  }>;
}