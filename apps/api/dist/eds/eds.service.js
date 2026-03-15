"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const child_process_1 = require("child_process");
const fs_2 = require("fs");
const eds_certificate_lab_1 = require("./eds-certificate-lab");
const eds_certificate_extractor_1 = require("./eds-certificate-extractor");
let EdsService = class EdsService {
    challenges = new Map();
    createChallenge() {
        const challengeId = (0, crypto_1.randomUUID)();
        const challengeBytes = (0, crypto_1.randomBytes)(32);
        const challengeBase64 = challengeBytes.toString('base64');
        const expiresAtMs = Date.now() + 5 * 60 * 1000;
        this.challenges.set(challengeId, {
            challengeId,
            challengeBase64,
            expiresAt: expiresAtMs,
        });
        return {
            challengeId,
            challengeBase64,
            expiresAt: new Date(expiresAtMs).toISOString(),
        };
    }
    attestSignature(payload) {
        const stored = this.challenges.get(payload.challengeId);
        if (!stored) {
            throw new common_1.BadRequestException('Challenge not found');
        }
        if (Date.now() > stored.expiresAt) {
            this.challenges.delete(payload.challengeId);
            throw new common_1.BadRequestException('Challenge expired');
        }
        if (stored.challengeBase64 !== payload.challengeBase64) {
            throw new common_1.BadRequestException('Challenge mismatch');
        }
        const result = this.extractCertificateInfoFromCms(payload.cmsSignatureBase64);
        const extractedIdentity = (0, eds_certificate_extractor_1.extractCertificateIdentity)(result.certificateLab);
        return {
            ok: true,
            message: 'CMS signature received and certificate parsed',
            challengeId: payload.challengeId,
            challengeBase64: payload.challengeBase64,
            cmsSignatureLength: payload.cmsSignatureBase64.length,
            parsedCertificate: result.parsedCertificate,
            cmsDebug: result.cmsDebug,
            receivedAt: new Date().toISOString(),
            extractedIdentity,
        };
    }
    saveAnalysis(payload) {
        const reportsDir = (0, path_1.join)(process.cwd(), 'reports');
        (0, fs_2.mkdirSync)(reportsDir, { recursive: true });
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const filePath = (0, path_1.join)(reportsDir, `eds-analysis-${timestamp}-${payload.challengeId}.json`);
        const mvpFieldMatrix = [
            {
                field: 'full_name',
                source: 'subjectString / CN',
                found: Boolean(payload.parsedCertificate.subjectCommonName),
                value: payload.parsedCertificate.subjectCommonName,
                useInMvp: true,
                note: 'Основной кандидат на ФИО для MVP',
            },
            {
                field: 'iin',
                source: 'subjectString regex(12 digits)',
                found: Boolean(payload.parsedCertificate.probableIin),
                value: payload.parsedCertificate.probableIin,
                useInMvp: true,
                note: 'Использовать только если стабильно извлекается',
            },
            {
                field: 'certificate_fingerprint',
                source: 'X509 raw cert -> sha256',
                found: Boolean(payload.parsedCertificate.fingerprintSha256),
                value: payload.parsedCertificate.fingerprintSha256,
                useInMvp: true,
                note: 'Надёжный технический идентификатор сертификата',
            },
            {
                field: 'certificate_serial',
                source: 'X509 serial',
                found: Boolean(payload.parsedCertificate.serialNumberHex),
                value: payload.parsedCertificate.serialNumberHex,
                useInMvp: true,
                note: 'Подходит для UserCert и аудита',
            },
            {
                field: 'certificate_valid_from',
                source: 'X509 validFrom',
                found: Boolean(payload.parsedCertificate.notBefore),
                value: payload.parsedCertificate.notBefore,
                useInMvp: true,
                note: 'Полезно для профиля и валидации сертификата',
            },
            {
                field: 'certificate_valid_to',
                source: 'X509 validTo',
                found: Boolean(payload.parsedCertificate.notAfter),
                value: payload.parsedCertificate.notAfter,
                useInMvp: true,
                note: 'Полезно для проверки срока действия',
            },
            {
                field: 'issuer',
                source: 'X509 issuer',
                found: Boolean(payload.parsedCertificate.issuerString),
                value: payload.parsedCertificate.issuerString,
                useInMvp: true,
                note: 'Важно для аудита и показа источника сертификата',
            },
            {
                field: 'organization',
                source: 'subjectString / O',
                found: Boolean(payload.parsedCertificate.subjectOrganization),
                value: payload.parsedCertificate.subjectOrganization,
                useInMvp: false,
                note: 'Скорее вспомогательное поле',
            },
            {
                field: 'org_unit',
                source: 'subjectString / OU',
                found: Boolean(payload.parsedCertificate.subjectOrgUnit),
                value: payload.parsedCertificate.subjectOrgUnit,
                useInMvp: false,
                note: 'Скорее вспомогательное поле',
            },
            {
                field: 'country',
                source: 'subjectString / C',
                found: Boolean(payload.parsedCertificate.subjectCountry),
                value: payload.parsedCertificate.subjectCountry,
                useInMvp: false,
                note: 'Не критично для MVP KYC',
            },
            {
                field: 'birth_date',
                source: 'not found from current cert parser',
                found: false,
                value: null,
                useInMvp: false,
                note: 'Нужен manual/mock, если не извлекается отдельно',
            },
            {
                field: 'residential_address',
                source: 'not found from current cert parser',
                found: false,
                value: null,
                useInMvp: false,
                note: 'Нужен manual/mock, если не извлекается отдельно',
            },
        ];
        const report = {
            savedAt: now.toISOString(),
            challengeId: payload.challengeId,
            parsedCertificate: payload.parsedCertificate,
            cmsDebug: payload.cmsDebug,
            mvpFieldMatrix,
            conclusion: {
                realFieldsForMvp: mvpFieldMatrix
                    .filter((item) => item.useInMvp && item.found)
                    .map((item) => item.field),
                missingFieldsForManualOrMock: mvpFieldMatrix
                    .filter((item) => !item.found)
                    .map((item) => item.field),
            },
        };
        (0, fs_1.writeFileSync)(filePath, JSON.stringify(report, null, 2), 'utf8');
        return {
            ok: true,
            filePath,
            summary: report.conclusion,
        };
    }
    extractCertificateInfoFromCms(cmsSignatureBase64) {
        const tempDir = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), 'dekyc-eds-'));
        const inputPath = (0, path_1.join)(tempDir, 'input.cms');
        const certsPemPath = (0, path_1.join)(tempDir, 'certs.pem');
        try {
            const normalized = this.normalizeCmsInput(cmsSignatureBase64);
            if (normalized.format === 'DER') {
                (0, fs_1.writeFileSync)(inputPath, normalized.content);
            }
            else {
                (0, fs_1.writeFileSync)(inputPath, normalized.content, 'utf8');
            }
            const informArg = normalized.format === 'DER'
                ? 'DER'
                : normalized.format === 'PEM'
                    ? 'PEM'
                    : 'SMIME';
            (0, child_process_1.execFileSync)('openssl', [
                'cms',
                '-cmsout',
                '-inform',
                informArg,
                '-in',
                inputPath,
                '-certsout',
                certsPemPath,
                '-out',
                '/dev/null',
            ], { stdio: 'pipe' });
            const certsPem = (0, fs_1.readFileSync)(certsPemPath, 'utf8');
            const firstCertPem = this.extractFirstCertificatePem(certsPem);
            if (!firstCertPem) {
                throw new Error('No PEM certificate extracted from CMS');
            }
            const x509 = new crypto_1.X509Certificate(firstCertPem);
            const labResult = (0, eds_certificate_lab_1.analyzeCertificatePem)(firstCertPem);
            console.log(JSON.stringify(labResult, null, 2));
            const subjectString = x509.subject;
            const issuerString = x509.issuer;
            const serialNumberHex = x509.serialNumber;
            const notBefore = new Date(x509.validFrom).toISOString();
            const notAfter = new Date(x509.validTo).toISOString();
            const fingerprintSha256 = (0, crypto_1.createHash)('sha256')
                .update(x509.raw)
                .digest('hex');
            const subjectCommonName = this.extractDnField(subjectString, 'CN');
            const subjectOrganization = this.extractDnField(subjectString, 'O');
            const subjectOrgUnit = this.extractDnField(subjectString, 'OU');
            const subjectCountry = this.extractDnField(subjectString, 'C');
            const probableIin = this.extractProbableIin(subjectString);
            return {
                parsedCertificate: {
                    subjectString,
                    issuerString,
                    serialNumberHex,
                    notBefore,
                    notAfter,
                    fingerprintSha256,
                    subjectCommonName,
                    subjectOrganization,
                    subjectOrgUnit,
                    subjectCountry,
                    probableIin,
                },
                certificateLab: labResult,
                cmsDebug: {
                    normalizedFormat: normalized.format,
                    detectedKind: normalized.debug.detectedKind,
                    firstBytesHex: normalized.debug.firstBytesHex,
                    firstTextPreview: normalized.debug.firstTextPreview,
                    originalLength: String(normalized.debug.originalLength),
                    trimmedLength: String(normalized.debug.trimmedLength),
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to parse CMS certificate: ${error instanceof Error ? error.message : 'Unknown parse error'}`);
        }
        finally {
            if ((0, fs_1.existsSync)(inputPath))
                (0, fs_1.unlinkSync)(inputPath);
            if ((0, fs_1.existsSync)(certsPemPath))
                (0, fs_1.unlinkSync)(certsPemPath);
        }
    }
    normalizeCmsInput(input) {
        const trimmed = input.trim();
        const originalLength = input.length;
        const trimmedLength = trimmed.length;
        if (trimmed.includes('-----BEGIN')) {
            return {
                format: 'PEM',
                content: trimmed,
                debug: {
                    originalLength,
                    trimmedLength,
                    detectedKind: 'direct-pem-text',
                    firstBytesHex: Buffer.from(trimmed.slice(0, 32), 'utf8').toString('hex'),
                    firstTextPreview: trimmed.slice(0, 120),
                },
            };
        }
        let decoded = Buffer.alloc(0);
        try {
            decoded = Buffer.from(trimmed, 'base64');
        }
        catch {
        }
        const firstBytesHex = decoded.subarray(0, 16).toString('hex');
        const decodedTextPreview = decoded.subarray(0, 120).toString('utf8');
        if (decodedTextPreview.includes('-----BEGIN')) {
            return {
                format: 'PEM',
                content: decoded.toString('utf8'),
                debug: {
                    originalLength,
                    trimmedLength,
                    detectedKind: 'base64-of-pem-text',
                    firstBytesHex,
                    firstTextPreview: decodedTextPreview,
                },
            };
        }
        if (decodedTextPreview.includes('MIME-Version:') ||
            decodedTextPreview.includes('Content-Type:')) {
            return {
                format: 'SMIME',
                content: decoded.toString('utf8'),
                debug: {
                    originalLength,
                    trimmedLength,
                    detectedKind: 'base64-of-smime-text',
                    firstBytesHex,
                    firstTextPreview: decodedTextPreview,
                },
            };
        }
        if (decoded.length > 4 && decoded[0] === 0x30) {
            return {
                format: 'DER',
                content: decoded,
                debug: {
                    originalLength,
                    trimmedLength,
                    detectedKind: 'base64-of-der',
                    firstBytesHex,
                    firstTextPreview: decodedTextPreview,
                },
            };
        }
        return {
            format: 'SMIME',
            content: trimmed,
            debug: {
                originalLength,
                trimmedLength,
                detectedKind: 'raw-text-fallback',
                firstBytesHex: Buffer.from(trimmed.slice(0, 32), 'utf8').toString('hex'),
                firstTextPreview: trimmed.slice(0, 120),
            },
        };
    }
    extractFirstCertificatePem(pemBundle) {
        const match = pemBundle.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/);
        return match?.[0] ?? null;
    }
    extractDnField(dn, field) {
        const regex = new RegExp(`(?:^|\\n|\\r|,|/)\\s*${field}\\s*=\\s*([^,\\n\\r/]+)`);
        const match = dn.match(regex);
        return match?.[1]?.trim() ?? null;
    }
    extractProbableIin(dn) {
        const twelveDigits = dn.match(/\b\d{12}\b/);
        return twelveDigits?.[0] ?? null;
    }
};
exports.EdsService = EdsService;
exports.EdsService = EdsService = __decorate([
    (0, common_1.Injectable)()
], EdsService);
//# sourceMappingURL=eds.service.js.map