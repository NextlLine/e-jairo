import dynamoose from "dynamoose";
import { AppTable } from "../table";
import { UserTransactionRepository } from "../../../domain/user/user_transaction.repository";
import { User } from "../../../domain/user/user.entity";
import { TeamMembership } from "../../../domain/team_membership/team_membership.entity";
import { UnitMembership } from "../../../domain/unit_membership/unit_membership.entity";
import { TeamMembershipRepository } from "../../../domain/team_membership/team_membership.repository";
import { UnitMembershipRepository } from "../../../domain/unit_membership/unit_membership.repository";
import { dynamooseTeamMembershipRepository } from "../repositories/team_membership.dynamoose.repository";
import { dynamooseUnitMembershipRepository } from "../repositories/unit_membership.dynamoose.repository";
import { UserRepository } from "../../../domain/user/user.repository";
import { dynamooseUserRepository } from "../repositories/user.dynamoose.repository";

export class DynamoUserTransactionRepository implements UserTransactionRepository {

    constructor(
        private userRepository: UserRepository,
        private teamMembershipRepository: TeamMembershipRepository,
        private unitMembershipRepository: UnitMembershipRepository
    ) { }

    async createUserWithMemberships(
        user: User,
        teamMembership: TeamMembership,
        unitMembership: UnitMembership
    ): Promise<void> {

        const userTransaction = this.userRepository.toTransactPut(user);
        const teamTransactions = this.teamMembershipRepository.toTransactPut(teamMembership);
        const unitTransactions = this.unitMembershipRepository.toTransactPut(unitMembership);

        await dynamoose.transaction([
            userTransaction,
            ...teamTransactions,
            ...unitTransactions
        ]);
    }
}

export const dynamooseUserTransactionRepository = new DynamoUserTransactionRepository(dynamooseUserRepository, dynamooseTeamMembershipRepository, dynamooseUnitMembershipRepository);