"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalizeSignedEnvelope = canonicalizeSignedEnvelope;
exports.signServiceResponse = signServiceResponse;
const crypto_1 = require("crypto");
function canonicalizeSignedEnvelope(input) {
    return JSON.stringify({
        payload: input.payload,
        meta: {
            timestamp: input.timestamp,
            nonce: input.nonce,
        },
    });
}
function signServiceResponse(input) {
    const canonical = canonicalizeSignedEnvelope({
        payload: input.payload,
        timestamp: input.timestamp,
        nonce: input.nonce,
    });
    const signature = (0, crypto_1.createHmac)('sha256', input.responseSigningSecret)
        .update(canonical)
        .digest('hex');
    return {
        canonical,
        signature,
    };
}
//# sourceMappingURL=service-response-signature.js.map