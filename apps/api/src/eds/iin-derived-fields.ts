export type DerivedGender = 'male' | 'female' | null;

export type DerivedIinFields = {
  birthDate: string | null;
  gender: DerivedGender;
  birthCentury: number | null;
};

export function deriveFieldsFromIin(iin: string | null): DerivedIinFields {
  if (!iin) {
    return {
      birthDate: null,
      gender: null,
      birthCentury: null,
    };
  }

  const normalized = iin.trim();

  if (!/^\d{12}$/.test(normalized)) {
    return {
      birthDate: null,
      gender: null,
      birthCentury: null,
    };
  }

  const yy = normalized.slice(0, 2);
  const mm = normalized.slice(2, 4);
  const dd = normalized.slice(4, 6);
  const genderCenturyDigit = normalized[6];

  const centuryInfo = resolveCenturyAndGender(genderCenturyDigit);

  if (!centuryInfo) {
    return {
      birthDate: null,
      gender: null,
      birthCentury: null,
    };
  }

  const fullYear = centuryInfo.century + Number(yy);
  const month = Number(mm);
  const day = Number(dd);

  if (!isValidDate(fullYear, month, day)) {
    return {
      birthDate: null,
      gender: centuryInfo.gender,
      birthCentury: centuryInfo.century,
    };
  }

  const birthDate = `${fullYear.toString().padStart(4, '0')}-${mm}-${dd}`;

  return {
    birthDate,
    gender: centuryInfo.gender,
    birthCentury: centuryInfo.century,
  };
}

function resolveCenturyAndGender(
  digit: string,
): { century: number; gender: DerivedGender } | null {
  switch (digit) {
    case '1':
      return { century: 1800, gender: 'male' };
    case '2':
      return { century: 1800, gender: 'female' };
    case '3':
      return { century: 1900, gender: 'male' };
    case '4':
      return { century: 1900, gender: 'female' };
    case '5':
      return { century: 2000, gender: 'male' };
    case '6':
      return { century: 2000, gender: 'female' };
    default:
      return null;
  }
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}