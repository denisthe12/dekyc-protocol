"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildScopedClaims = buildScopedClaims;
function buildScopedClaims(params) {
    const { profile, allowedClaims, requestedClaims } = params;
    const requested = requestedClaims && requestedClaims.length > 0
        ? requestedClaims
        : allowedClaims;
    const finalClaims = requested.filter((claim) => allowedClaims.includes(claim));
    const fullName = [profile.lastName, profile.firstName, profile.middleName]
        .filter(Boolean)
        .join(' ');
    const source = {
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
    const claims = {};
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
function deriveAge18Plus(birthDate) {
    if (!birthDate)
        return null;
    const date = new Date(birthDate);
    if (Number.isNaN(date.getTime()))
        return null;
    const now = new Date();
    let age = now.getUTCFullYear() - date.getUTCFullYear();
    const monthDiff = now.getUTCMonth() - date.getUTCMonth();
    const dayDiff = now.getUTCDate() - date.getUTCDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
    }
    return age >= 18;
}
//# sourceMappingURL=kyc-claims-policy.js.map