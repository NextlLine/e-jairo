import { UserRole } from "../../domain/type/UserRole";
import { UserRepository } from "../../domain/user/user.repository";
import { HttpError } from "../errors/http-error";

export async function verifyUserRole(
    userSub: string,
    allowedRoles: UserRole[],
    userRepository: UserRepository
) {
    const user = await userRepository.findById(userSub);
    if (!user) {
        throw new HttpError(404, "UserNotFound");
    }

    if (!allowedRoles.includes(user.role)) {
        throw new HttpError(403, "PermissionDenied");
    }
}   