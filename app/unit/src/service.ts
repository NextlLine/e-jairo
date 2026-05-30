import z from "zod";
import { UnitRepository } from "../../../domain/unit/unit.repository";
import { Unit } from "../../../domain/unit/unit.entity";
import { Address } from "../../../domain/address/address.entity";
import { randomUUID } from "crypto";
import { HttpError } from "../../../shared/errors/http-error";
import { UserRepository } from "../../../domain/user/user.repository";
import { TeamRole } from "../../../domain/type/TeamRole";
import { verifyUserRole } from "../../../shared/verification/verifyUserRole";

const AddressSchema = z.object({
    street: z.string().min(3).max(100),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50),
    zipCode: z.string().min(4).max(10),
    country: z.string().min(2).max(50),
})
const CreateUnitSchema = z.object({
    name: z.string().min(3).max(50),
    address: AddressSchema,
});

export class UnitService {
    constructor(
        private readonly unitRepository: UnitRepository,
        private readonly userRepository: UserRepository
    ) { }

    async createUnit(data: z.infer<typeof CreateUnitSchema>, userSub: string) {
        await verifyUserRole(userSub, [TeamRole.ADMIN], this.userRepository);

        const validatedData = CreateUnitSchema.parse(data);

        const address = new Address(
            validatedData.address.street,
            validatedData.address.city,
            validatedData.address.state,
            validatedData.address.zipCode,
            validatedData.address.country
        );

        const newUnit = new Unit(
            randomUUID(),
            validatedData.name,
            address
        );

        try {
            await this.unitRepository.create(newUnit);

            return newUnit;
            

        } catch (error: unknown) {
            console.error("Error creating unit:", error);
            throw new HttpError(500, "Erro ao criar unidade");
        }
    }
}