import { Address } from "../../../domain/address/address.entity";
import { Patient } from "../../../domain/patient/patient.entity";
import { PatientRepository } from "../../../domain/patient/patient.repository";
import { AppTable } from "../table";

class PatientDynamooseRepository implements PatientRepository {
async create(patient: Patient): Promise<void> {
    await AppTable.create({
      PK: `PATIENT#${patient.id}`,
      SK: "PROFILE",
      entity: "PATIENT",

      name: patient.name,
      address: patient.address,
      city: patient.address.city,
      state: patient.address.state,

      lastTeamId: patient.lastTeamId,
      isPregnant: patient.isPregnant,
      pregnancyDueDate: patient.pregnancyDueDate,

      GSI1PK: patient.address.toRegionKey(),
      GSI1SK: `PATIENT#${patient.id}`,

      GSI2PK: `TEAM#${patient.lastTeamId}`,
      GSI2SK: `PATIENT#${patient.id}`,

      ...(patient.isPregnant && {
        GSI3PK: "PREGNANT",
        GSI3SK: `PATIENT#${patient.id}`,
      }),
    });
  }

  async findById(id: string): Promise<Patient | null> {
    const item = await AppTable.get({
      PK: `PATIENT#${id}`,
      SK: "PROFILE",
    });

    if (!item) return null;

    return new Patient(
      id,
      item.name,
      new Address(
        item.address.street,
        item.address.city,
        item.address.state,
        item.address.zipCode,
        item.address.country
      ),
      item.lastTeamId,
      item.isPregnant,
      item.pregnancyDueDate
    );
  }

  async findByLastTeam(teamId: string): Promise<Patient[]> {
    const result = await AppTable.query("GSI2PK")
      .eq(`TEAM#${teamId}`)
      .using("GSI2")
      .exec();

    return result.map((item) =>
      new Patient(
        item.PK.replace("PATIENT#", ""),
        item.name,
        new Address(
          item.address.street,
          item.address.city,
          item.address.state,
          item.address.zipCode,
          item.address.country
        ),
        item.lastTeamId,
        item.isPregnant,
        item.pregnancyDueDate
      )
    );
  }

  async listPregnant(): Promise<Patient[]> {
    const result = await AppTable.query("GSI3PK")
      .eq("PREGNANT")
      .using("GSI3")
      .exec();

    return result.map((item) =>
      new Patient(
        item.PK.replace("PATIENT#", ""),
        item.name,
        new Address(
          item.address.street,
          item.address.city,
          item.address.state,
          item.address.zipCode,
          item.address.country
        ),
        item.lastTeamId,
        item.isPregnant,
        item.pregnancyDueDate
      )
    );
  }
}

export const dynamoosePatientRepository = new PatientDynamooseRepository();