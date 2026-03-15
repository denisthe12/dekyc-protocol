export type DerivedGender = 'male' | 'female' | null;
export type DerivedIinFields = {
    birthDate: string | null;
    gender: DerivedGender;
    birthCentury: number | null;
};
export declare function deriveFieldsFromIin(iin: string | null): DerivedIinFields;
