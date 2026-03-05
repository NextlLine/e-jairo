import { UserRepository } from "../../../domain/user/user.repository";
import { HttpError } from "../../../shared/errors/http-error";

export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async getUserById(userId: string) {
        try {
            return await this.userRepository.findById(userId);
        } catch (error) {
            throw new HttpError(500, "Erro ao buscar usuário");
        }
    }
}