"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityAssertionsSigner = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const base64url_1 = require("./utils/base64url");
let IdentityAssertionsSigner = class IdentityAssertionsSigner {
    signPayload(payload) {
        const header = {
            alg: 'HS256',
            typ: 'JWT',
            kid: this.getKeyId(),
        };
        const encodedHeader = (0, base64url_1.encodeBase64Url)(JSON.stringify(header));
        const encodedPayload = (0, base64url_1.encodeBase64Url)(JSON.stringify(payload));
        const signingInput = `${encodedHeader}.${encodedPayload}`;
        const signature = this.signSigningInput(signingInput);
        return `${signingInput}.${signature}`;
    }
    verifyAndDecode(assertionJws) {
        const parsed = this.parseJws(assertionJws);
        if (!parsed) {
            return {
                valid: false,
                reason: 'invalid_jws_format',
                payload: null,
            };
        }
        if (parsed.header.alg !== 'HS256') {
            return {
                valid: false,
                reason: 'unsupported_algorithm',
                payload: null,
            };
        }
        const expectedSignature = this.signSigningInput(parsed.signingInput);
        if (!this.safeEqual(expectedSignature, parsed.signature)) {
            return {
                valid: false,
                reason: 'invalid_signature',
                payload: null,
            };
        }
        return {
            valid: true,
            reason: null,
            payload: parsed.payload,
        };
    }
    getPublicJwks() {
        return {
            keys: [
                {
                    kty: 'oct',
                    kid: this.getKeyId(),
                    alg: 'HS256',
                    use: 'sig',
                    note: 'MVP sandbox uses server-side HS256 verification. Production should rotate to asymmetric JWKS.',
                },
            ],
        };
    }
    parseJws(assertionJws) {
        const parts = assertionJws.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const [encodedHeader, encodedPayload, signature] = parts;
        if (!encodedHeader || !encodedPayload || !signature) {
            return null;
        }
        try {
            const header = (0, base64url_1.decodeBase64UrlJson)(encodedHeader);
            const payload = (0, base64url_1.decodeBase64UrlJson)(encodedPayload);
            if (!this.isAssertionPayload(payload)) {
                return null;
            }
            return {
                header,
                payload,
                signingInput: `${encodedHeader}.${encodedPayload}`,
                signature,
            };
        }
        catch {
            return null;
        }
    }
    signSigningInput(signingInput) {
        const signature = (0, crypto_1.createHmac)('sha256', this.getSigningSecret())
            .update(signingInput)
            .digest();
        return (0, base64url_1.encodeBase64Url)(signature);
    }
    safeEqual(left, right) {
        const leftBuffer = Buffer.from(left);
        const rightBuffer = Buffer.from(right);
        if (leftBuffer.length !== rightBuffer.length) {
            return false;
        }
        return (0, crypto_1.timingSafeEqual)(leftBuffer, rightBuffer);
    }
    isAssertionPayload(value) {
        if (typeof value !== 'object' || value === null) {
            return false;
        }
        const payload = value;
        return (typeof payload.iss === 'string' &&
            typeof payload.aud === 'string' &&
            typeof payload.assertionId === 'string' &&
            typeof payload.subjectId === 'string' &&
            typeof payload.serviceSubjectId === 'string' &&
            typeof payload.serviceId === 'string' &&
            typeof payload.verificationStatus === 'string' &&
            typeof payload.verificationTime === 'string' &&
            typeof payload.kycProvider === 'string' &&
            typeof payload.assuranceLevel === 'string' &&
            typeof payload.consentId === 'string' &&
            Array.isArray(payload.claimsScope) &&
            typeof payload.revocationStatus === 'string' &&
            typeof payload.iat === 'number' &&
            typeof payload.exp === 'number');
    }
    getSigningSecret() {
        return (process.env.DEKYC_CONNECT_SIGNING_SECRET ??
            process.env.MASTER_SECRET ??
            process.env.JWT_SECRET ??
            'dekyc-dev-connect-signing-secret');
    }
    getKeyId() {
        return process.env.DEKYC_CONNECT_KEY_ID ?? 'dekyc-connect-hs256-v1';
    }
};
exports.IdentityAssertionsSigner = IdentityAssertionsSigner;
exports.IdentityAssertionsSigner = IdentityAssertionsSigner = __decorate([
    (0, common_1.Injectable)()
], IdentityAssertionsSigner);
//# sourceMappingURL=identity-assertions.signer.js.map