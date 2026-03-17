"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCOPE_TO_CLAIM = exports.CLAIM_TO_SCOPE = exports.PERMISSION_SCOPES = void 0;
exports.PERMISSION_SCOPES = [
    'kyc.full_name',
    'kyc.email',
    'kyc.iin',
    'kyc.birth_date',
    'kyc.gender',
    'kyc.country',
    'kyc.verified',
    'kyc.age_18_plus',
];
exports.CLAIM_TO_SCOPE = {
    fullName: 'kyc.full_name',
    email: 'kyc.email',
    iin: 'kyc.iin',
    birthDate: 'kyc.birth_date',
    gender: 'kyc.gender',
    country: 'kyc.country',
    verified: 'kyc.verified',
    age18Plus: 'kyc.age_18_plus',
};
exports.SCOPE_TO_CLAIM = {
    'kyc.full_name': 'fullName',
    'kyc.email': 'email',
    'kyc.iin': 'iin',
    'kyc.birth_date': 'birthDate',
    'kyc.gender': 'gender',
    'kyc.country': 'country',
    'kyc.verified': 'verified',
    'kyc.age_18_plus': 'age18Plus',
};
//# sourceMappingURL=permission-scopes.js.map