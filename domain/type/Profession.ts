export const Profession = {
  TEC_ENFERMAGEM: "TEC_ENFERMAGEM",
  MEDICO: "MEDICO",
  ENFERMEIRO: "ENFERMEIRO",
} as const;

export type Profession =
  typeof Profession[keyof typeof Profession];

export const ProfessionValues = Object.values(
  Profession
) as [Profession, ...Profession[]];