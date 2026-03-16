export class UpsertKycProfileDto {
  userId!: string;

  fullName!: string | null;
  firstName!: string | null;
  lastName!: string | null;
  middleName!: string | null;
  iin!: string | null;
  email!: string | null;
  birthDate!: string | null;
  gender!: string | null;
  country!: string | null;

  source!: string;
  status!: string;
}