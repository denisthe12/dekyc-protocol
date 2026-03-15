"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCertificatePem = analyzeCertificatePem;
const crypto_1 = require("crypto");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
function analyzeCertificatePem(pem) {
    const cert = new crypto_1.X509Certificate(pem);
    const ownPropertyNames = Object.getOwnPropertyNames(cert);
    const prototypePropertyNames = Object.getOwnPropertyNames(Object.getPrototypeOf(cert));
    const enumerableSnapshot = safeSnapshot(cert);
    const subjectRaw = cert.subject;
    const issuerRaw = cert.issuer;
    const subjectLines = splitDnLines(subjectRaw);
    const issuerLines = splitDnLines(issuerRaw);
    const subjectFields = parseDnLines(subjectRaw);
    const issuerFields = parseDnLines(issuerRaw);
    const openssl = getOpenSslCertificateDump(pem);
    return {
        nodeX509: {
            ownPropertyNames,
            prototypePropertyNames,
            enumerableSnapshot,
        },
        parsedNames: {
            subjectRaw,
            issuerRaw,
            subjectFields,
            issuerFields,
            subjectLines,
            issuerLines,
        },
        openssl,
    };
}
function safeSnapshot(cert) {
    const keys = [
        'subject',
        'issuer',
        'subjectAltName',
        'infoAccess',
        'validFrom',
        'validTo',
        'validFromDate',
        'validToDate',
        'fingerprint',
        'fingerprint256',
        'fingerprint512',
        'serialNumber',
        'keyUsage',
        'ca',
        'raw',
        'publicKey',
        'toString',
        'toJSON',
    ];
    const result = {};
    for (const key of keys) {
        try {
            const value = cert[key];
            if (Buffer.isBuffer(value)) {
                result[key] = {
                    type: 'Buffer',
                    length: value.length,
                    hexPreview: value.subarray(0, 32).toString('hex'),
                };
                continue;
            }
            if (typeof value === 'function') {
                result[key] = '[function]';
                continue;
            }
            if (value && typeof value === 'object') {
                result[key] = Object.prototype.toString.call(value);
                continue;
            }
            result[key] = value ?? null;
        }
        catch (error) {
            result[key] =
                error instanceof Error ? `[error] ${error.message}` : '[error]';
        }
    }
    return result;
}
function splitDnLines(dn) {
    return dn
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}
function parseDnLines(dn) {
    const fields = {};
    const lines = splitDnLines(dn);
    for (const line of lines) {
        const idx = line.indexOf('=');
        if (idx === -1)
            continue;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        fields[key] = value;
    }
    return fields;
}
function getOpenSslCertificateDump(pem) {
    const tempDir = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), 'dekyc-cert-lab-'));
    const certPath = (0, path_1.join)(tempDir, 'cert.pem');
    try {
        (0, fs_1.writeFileSync)(certPath, pem, 'utf8');
        const text = (0, child_process_1.execFileSync)('openssl', ['x509', '-in', certPath, '-text', '-noout', '-certopt', 'ext_parse,ext_dump'], { encoding: 'utf8', stdio: 'pipe' });
        const subject = (0, child_process_1.execFileSync)('openssl', ['x509', '-in', certPath, '-subject', '-noout'], { encoding: 'utf8', stdio: 'pipe' });
        const issuer = (0, child_process_1.execFileSync)('openssl', ['x509', '-in', certPath, '-issuer', '-noout'], { encoding: 'utf8', stdio: 'pipe' });
        const serial = (0, child_process_1.execFileSync)('openssl', ['x509', '-in', certPath, '-serial', '-noout'], { encoding: 'utf8', stdio: 'pipe' });
        const dates = (0, child_process_1.execFileSync)('openssl', ['x509', '-in', certPath, '-dates', '-noout'], { encoding: 'utf8', stdio: 'pipe' });
        const email = (0, child_process_1.execFileSync)('openssl', ['x509', '-in', certPath, '-email', '-noout'], { encoding: 'utf8', stdio: 'pipe' });
        const ocspUri = (0, child_process_1.execFileSync)('openssl', ['x509', '-in', certPath, '-ocsp_uri', '-noout'], { encoding: 'utf8', stdio: 'pipe' });
        const fingerprintSha256 = (0, child_process_1.execFileSync)('openssl', ['x509', '-in', certPath, '-fingerprint', '-sha256', '-noout'], { encoding: 'utf8', stdio: 'pipe' });
        return {
            text: text.trim(),
            subject: subject.trim(),
            issuer: issuer.trim(),
            serial: serial.trim(),
            dates: dates.trim(),
            email: email.trim(),
            ocspUri: ocspUri.trim(),
            fingerprintSha256: fingerprintSha256.trim(),
        };
    }
    finally {
        if ((0, fs_1.existsSync)(certPath)) {
            (0, fs_1.unlinkSync)(certPath);
        }
    }
}
//# sourceMappingURL=eds-certificate-lab.js.map