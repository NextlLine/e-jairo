import { TeamRole } from "../domain/types/TeamRole";
import { UserRepository } from "../domain/user/user.repository";
import { HttpError } from "./errors/http-error";

export async function verifyUserRole(
    userSub: string,
    allowedRoles: TeamRole[],
    userRepository: UserRepository
) {
    const user = await userRepository.findById(userSub);
    if (!user) {
        throw new HttpError(404, "Usuário não encontrado");
    }

    if (!allowedRoles.includes(user.role)) {
        throw new HttpError(403, "Permissão negada");
    }
}   