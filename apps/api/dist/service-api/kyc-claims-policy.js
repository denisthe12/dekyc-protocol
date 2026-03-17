"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildScopedClaims = buildScopedClaims;
const permission_scopes_1 = require("../permissions/permission-scopes");
function buildScopedClaims(params) {
    const { profile, allowedClaims, requestedClaims } = params;
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
    const allowedScopes = allowedClaims
        .map((claim) => permission_scopes_1.CLAIM_TO_SCOPE[claim])
        .filter(Boolean);
    const requested = requestedClaims && requestedClaims.length > 0
        ? requestedClaims
        : allowedClaims;
    const requestedScopes = requested
        .map((claim) => permission_scopes_1.CLAIM_TO_SCOPE[claim])
        .filter(Boolean);
    const finalScopes = requestedScopes.filter((scope) => allowedScopes.includes(scope));
    const claims = {};
    for (const scope of finalScopes) {
        const claim = permission_scopes_1.SCOPE_TO_CLAIM[scope];
        if (claim in source) {
            claims[claim] = source[claim];
        }
    }
    return {
        claims,
        grantedClaims: Object.keys(claims),
        grantedScopes: finalScopes,
        allowedScopes,
        requestedScopes,
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