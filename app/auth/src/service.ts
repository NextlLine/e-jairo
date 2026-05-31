import z from "zod";
import { User } from "../../../domain/user/user.entity";
import { AuthProvider } from "../../../infra/auth/auth.provider";
import { TeamRepository } from "../../../domain/team/team.repository";
import { HttpError } from "../../../shared/errors/http-error";
import { UserRole } from "../../../domain/type/UserRole";
import { TeamMembership } from "../../../domain/team_membership/team_membership.entity";
import { UnitMembership } from "../../../domain/unit_membership/unit_membership.entity";
import { TeamRole } from "../../../domain/type/TeamRole";
import { UnitRole } from "../../../domain/type/UnitRole";
import { UserTransactionRepository } from "../../../domain/user/user_transaction.repository";
import { ProfessionValues } from "../../../domain/type/Profession";
import { UserRepository } from "../../../domain/user/user.repository";

function getSubFromIdToken(idToken: string): string {
  const payload = idToken.split(".")[1];

  if (!payload) {
    throw new HttpError(500, "InvalidTokenPayload");
  }

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalizedPayload.length % 4;
  const base64Payload = normalizedPayload + (padding ? "=".repeat(4 - padding) : "");
  const decodedPayload = Buffer.from(base64Payload, "base64").toString("utf8");

  const parsedPayload = JSON.parse(decodedPayload) as { sub?: string };

  if (!parsedPayload.sub) {
    throw new HttpError(500, "InvalidTokenPayload");
  }

  return parsedPayload.sub;
}

const SignUpUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string(),
  profession: z.enum(ProfessionValues),
  teamCode: z.string(),
});

const SignInUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const ConfirmCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export class AuthService {
  constructor(
    private readonly authProvider: AuthProvider,
    private readonly teamRepository: TeamRepository,
    private readonly userTransactionRepository: UserTransactionRepository,
    private readonly userRepository: UserRepository,
  ) { }

  async signUp(userData: z.infer<typeof SignUpUserSchema>) {
    const validatedData = SignUpUserSchema.parse(userData);

    const team = await this.teamRepository.findById(validatedData.teamCode);
    if (!team) {
      throw new HttpError(404, "TeamCodeInvalid");
    }

    const { userId } = await this.authProvider.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    const user = new User(
      userId,
      validatedData.email,
      validatedData.name,
      validatedData.profession,
      UserRole.USER
    );
    
    const teamMembership = new TeamMembership(
      userId,
      team.id,
      TeamRole.MEMBER
    );

    const unitMembership = new UnitMembership(
      userId,
      team.unitId,
      UnitRole.MEMBER
    )

    await this.userTransactionRepository.createUserWithMemberships(
      user,
      teamMembership,
      unitMembership
    );

    return { userId };
  }

  async confirmCode(data: z.infer<typeof ConfirmCodeSchema>) {
    const validatedData = ConfirmCodeSchema.parse(data);

    return this.authProvider.confirmCode(validatedData);
  }

  async signIn(data: z.infer<typeof SignInUserSchema>) {
    const validatedData = SignInUserSchema.parse(data);
    const authResult = await this.authProvider.signIn(validatedData);
    const userSub = getSubFromIdToken(authResult.idToken);
    const user = await this.userRepository.findById(userSub);

    if (!user) {
      throw new HttpError(404, "UserNotFound");
    }

    return {
      ...authResult,
      role: user.role,
    };
  }
}