"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectIdService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const SUBJECT_ID_PREFIX = 'sub';
const SERVICE_SUBJECT_ID_PREFIX = 'svcsub';
const HASH_LENGTH = 40;
let SubjectIdService = class SubjectIdService {
    generateSubjectId(userId) {
        return this.buildPublicId(SUBJECT_ID_PREFIX, [
            userId,
            (0, crypto_1.randomUUID)(),
            Date.now().toString(),
        ]);
    }
    generateServiceSubjectId(input) {
        return this.buildPublicId(SERVICE_SUBJECT_ID_PREFIX, [
            input.userId,
            input.serviceId,
            input.subjectId,
            (0, crypto_1.randomUUID)(),
            Date.now().toString(),
        ]);
    }
    buildPublicId(prefix, parts) {
        const namespaceSecret = this.getNamespaceSecret();
        const digest = (0, crypto_1.createHash)('sha256')
            .update([namespaceSecret, ...parts].join(':'))
            .digest('hex')
            .slice(0, HASH_LENGTH);
        return `${prefix}_${digest}`;
    }
    getNamespaceSecret() {
        return (process.env.DEKYC_SUBJECT_NAMESPACE_SECRET ??
            process.env.MASTER_SECRET ??
            process.env.JWT_SECRET ??
            'dekyc-dev-subject-namespace-secret');
    }
};
exports.SubjectIdService = SubjectIdService;
exports.SubjectIdService = SubjectIdService = __decorate([
    (0, common_1.Injectable)()
], SubjectIdService);
//# sourceMappingURL=subject-id.service.js.map