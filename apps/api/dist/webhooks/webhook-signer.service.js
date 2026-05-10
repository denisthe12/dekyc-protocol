"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSignerService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const canonical_json_1 = require("../consent-receipts/utils/canonical-json");
let WebhookSignerService = class WebhookSignerService {
    createSigningSecret(endpointId) {
        const seed = (0, crypto_1.createHmac)('sha256', this.getRootSecret())
            .update(endpointId)
            .digest('hex');
        return `whsec_${seed}`;
    }
    createRandomEndpointIdSalt() {
        return (0, crypto_1.randomBytes)(16).toString('hex');
    }
    hashSecret(secret) {
        return (0, crypto_1.createHash)('sha256').update(secret).digest('hex');
    }
    signPayload(input) {
        const canonicalPayload = (0, canonical_json_1.stringifyCanonicalJson)(input.payload);
        const signingInput = `${input.timestamp}.${canonicalPayload}`;
        const signature = (0, crypto_1.createHmac)('sha256', input.signingSecret)
            .update(signingInput)
            .digest('hex');
        return `v1=${signature}`;
    }
    getRootSecret() {
        return (process.env.DEKYC_WEBHOOK_ROOT_SECRET ??
            process.env.DEKYC_CONNECT_SIGNING_SECRET ??
            process.env.MASTER_SECRET ??
            process.env.JWT_SECRET ??
            'dekyc-dev-webhook-root-secret');
    }
};
exports.WebhookSignerService = WebhookSignerService;
exports.WebhookSignerService = WebhookSignerService = __decorate([
    (0, common_1.Injectable)()
], WebhookSignerService);
//# sourceMappingURL=webhook-signer.service.js.map