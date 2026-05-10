import { Injectable } from '@nestjs/common';
import { createHash, createHmac, randomBytes } from 'crypto';
import { stringifyCanonicalJson } from '../consent-receipts/utils/canonical-json';

@Injectable()
export class WebhookSignerService {
  createSigningSecret(endpointId: string): string {
    const seed = createHmac('sha256', this.getRootSecret())
      .update(endpointId)
      .digest('hex');

    return `whsec_${seed}`;
  }

  createRandomEndpointIdSalt(): string {
    return randomBytes(16).toString('hex');
  }

  hashSecret(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }

  signPayload(input: {
    signingSecret: string;
    timestamp: number;
    payload: unknown;
  }): string {
    const canonicalPayload = stringifyCanonicalJson(input.payload);
    const signingInput = `${input.timestamp}.${canonicalPayload}`;

    const signature = createHmac('sha256', input.signingSecret)
      .update(signingInput)
      .digest('hex');

    return `v1=${signature}`;
  }

  private getRootSecret(): string {
    return (
      process.env.DEKYC_WEBHOOK_ROOT_SECRET ??
      process.env.DEKYC_CONNECT_SIGNING_SECRET ??
      process.env.MASTER_SECRET ??
      process.env.JWT_SECRET ??
      'dekyc-dev-webhook-root-secret'
    );
  }
}