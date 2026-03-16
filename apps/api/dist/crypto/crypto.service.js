"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let CryptoService = class CryptoService {
    algorithm = 'aes-256-gcm';
    keyVersion = 'v1';
    encryptJson(payload) {
        const key = this.getMasterKey();
        const iv = (0, crypto_1.randomBytes)(12);
        const cipher = (0, crypto_1.createCipheriv)(this.algorithm, key, iv);
        const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
        const encrypted = Buffer.concat([
            cipher.update(plaintext),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();
        return {
            cipherText: encrypted.toString('base64'),
            iv: iv.toString('base64'),
            authTag: authTag.toString('base64'),
            algorithm: this.algorithm,
            keyVersion: this.keyVersion,
        };
    }
    decryptJson(input) {
        const key = this.getMasterKey();
        const decipher = (0, crypto_1.createDecipheriv)(this.algorithm, key, Buffer.from(input.iv, 'base64'));
        decipher.setAuthTag(Buffer.from(input.authTag, 'base64'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(input.cipherText, 'base64')),
            decipher.final(),
        ]);
        return JSON.parse(decrypted.toString('utf8'));
    }
    computeKycHash(payload) {
        const normalized = JSON.stringify(payload);
        return (0, crypto_1.createHash)('sha256').update(normalized).digest('hex');
    }
    getMasterKey() {
        const raw = process.env.KYC_MASTER_KEY;
        if (!raw) {
            throw new Error('KYC_MASTER_KEY is not configured');
        }
        const key = Buffer.from(raw, 'hex');
        if (key.length !== 32) {
            throw new Error('KYC_MASTER_KEY must be 32 bytes (64 hex chars)');
        }
        return key;
    }
};
exports.CryptoService = CryptoService;
exports.CryptoService = CryptoService = __decorate([
    (0, common_1.Injectable)()
], CryptoService);
//# sourceMappingURL=crypto.service.js.map