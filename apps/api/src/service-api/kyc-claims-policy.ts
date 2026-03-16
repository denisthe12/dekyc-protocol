type KycProfileLike = {
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  iin: string | null;
  email: string | null;
  birthDate: string | null;
  gender: string | null;
  country: string | null;
};

export function buildScopedClaims(params: {
  profile: KycProfileLike;
  allowedClaims: string[];
  requestedClaims?: string[];
}) {
  const { profile, allowedClaims, requestedClaims } = params;

  const requested =
    requestedClaims && requestedClaims.length > 0
      ? requestedClaims
      : allowedClaims;

  const finalClaims = requested.filter((claim) => allowedClaims.includes(claim));

  const fullName = [profile.lastName, profile.firstName, profile.middleName]
    .filter(Boolean)
    .join(' ');

  const source: Record<string, unknown> = {
    fullName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    middleName: profile.middleName,
    iin: profile.iin,
    email: profile.email,
    birthDate: profile.birthDate,
    gender: profile.gender,
    country: profile.country,
    verified: true,
    age18Plus: deriveAge18Plus(profile.birthDate),
  };

  const claims: Record<string, unknown> = {};

  for (const claim of finalClaims) {
    if (claim in source) {
      claims[claim] = source[claim];
    }
  }

  return {
    claims,
    grantedClaims: Object.keys(claims),
  };
}

function deriveAge18Plus(birthDate: string | null): boolean | null {
  if (!birthDate) return null;

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();

  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - date.getUTCMonth();
  const dayDiff = now.getUTCDate() - date.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 18;
}