"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCertificateIdentity = extractCertificateIdentity;
const iin_derived_fields_1 = require("./iin-derived-fields");
function extractCertificateIdentity(lab) {
    const subjectFields = lab.parsedNames?.subjectFields ?? {};
    const issuerFields = lab.parsedNames?.issuerFields ?? {};
    const snapshot = lab.nodeX509?.enumerableSnapshot ?? {};
    const cn = subjectFields['CN'] ?? null;
    const sn = subjectFields['SN'] ?? null;
    const gn = subjectFields['GN'] ?? null;
    const serialNumberField = subjectFields['serialNumber'] ?? null;
    const iin = extractIinFromSubjectSerial(serialNumberField);
    const email = normalizeEmail(lab.openssl?.email ?? null);
    const fullName = cn;
    const lastName = sn;
    const middleName = gn;
    const firstName = extractFirstNameFromCn(cn, sn);
    const derived = (0, iin_derived_fields_1.deriveFieldsFromIin)(iin);
    return {
        fullName,
        firstName,
        lastName,
        middleName,
        iin,
        email,
        birthDate: derived.birthDate,
        gender: derived.gender,
        birthCentury: derived.birthCentury,
        certificateSerialNumber: toNullableString(snapshot.serialNumber),
        certificateFingerprint256: toNullableString(snapshot.fingerprint256),
        certificateValidFrom: toNullableString(snapshot.validFrom),
        certificateValidTo: toNullableString(snapshot.validTo),
        certificateIssuer: toNullableString(snapshot.issuer),
        certificateSubject: toNullableString(snapshot.subject),
        rawSubjectFields: subjectFields,
        rawIssuerFields: issuerFields,
    };
}
function extractIinFromSubjectSerial(value) {
    if (!value)
        return null;
    const normalized = value.trim();
    const prefixed = normalized.match(/^IIN(\d{12})$/i);
    if (prefixed)
        return prefixed[1];
    const plain12 = normalized.match(/\b(\d{12})\b/);
    if (plain12)
        return plain12[1];
    return null;
}
function extractFirstNameFromCn(cn, lastName) {
    if (!cn)
        return null;
    const normalizedCn = cn.trim();
    if (!lastName) {
        const parts = normalizedCn.split(/\s+/).filter(Boolean);
        return parts.length >= 2 ? parts[1] : null;
    }
    const escapedLastName = escapeRegex(lastName.trim());
    const regex = new RegExp(`^${escapedLastName}\\s+(.+)$`, 'i');
    const match = normalizedCn.match(regex);
    if (match?.[1]) {
        return match[1].trim();
    }
    const parts = normalizedCn.split(/\s+/).filter(Boolean);
    return parts.length >= 2 ? parts[parts.length - 1] : null;
}
function normalizeEmail(value) {
    if (!value)
        return null;
    const email = value.trim();
    return email.length > 0 ? email : null;
}
function toNullableString(value) {
    return typeof value === 'string' && value.trim().length > 0
        ? value.trim()
        : null;
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
//# sourceMappingURL=eds-certificate-extractor.js.map