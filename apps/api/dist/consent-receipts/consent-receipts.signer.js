"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentReceiptsSigner = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const canonical_json_1 = require("./utils/canonical-json");
let ConsentReceiptsSigner = class ConsentReceiptsSigner {
    createReceiptHash(payload) {
        const canonicalPayload = (0, canonical_json_1.stringifyCanonicalJson)(payload);
        return (0, crypto_1.createHash)('sha256')
            .update(canonicalPayload)
            .digest('hex');
    }
    signReceiptHash(receiptHash) {
        return (0, crypto_1.createHmac)('sha256', this.getSigningSecret())
            .update(receiptHash)
            .digest('hex');
    }
    verifyReceiptSignature(input) {
        const expectedSignature = this.signReceiptHash(input.receiptHash);
        return expectedSignature === input.signature;
    }
    getSigningSecret() {
        return (process.env.DEKYC_CONNECT_SIGNING_SECRET ??
            process.env.MASTER_SECRET ??
            process.env.JWT_SECRET ??
            'dekyc-dev-connect-signing-secret');
    }
};
exports.ConsentReceiptsSigner = ConsentReceiptsSigner;
exports.ConsentReceiptsSigner = ConsentReceiptsSigner = __decorate([
    (0, common_1.Injectable)()
], ConsentReceiptsSigner);
//# sourceMappingURL=consent-receipts.signer.js.map