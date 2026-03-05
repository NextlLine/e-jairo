import { Patient } from "./patient.entity";
export interface PatientRepository {
  create(patient: Patient): Promise<void>;
  findById(id: string): Promise<Patient | null>;
  findByLastTeam(teamId: string): Promise<Patient[]>;
  listPregnant(): Promise<Patient[]>;
}