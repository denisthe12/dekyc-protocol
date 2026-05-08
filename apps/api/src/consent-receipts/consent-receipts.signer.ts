import { Injectable } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';
import { stringifyCanonicalJson } from './utils/canonical-json';
import type { ConsentReceiptSignablePayload } from './types/consent-receipt-signable-payload.type';

@Injectable()
export class ConsentReceiptsSigner {
  createReceiptHash(payload: ConsentReceiptSignablePayload): string {
    const canonicalPayload = stringifyCanonicalJson(payload);

    return createHash('sha256')
      .update(canonicalPayload)
      .digest('hex');
  }

  signReceiptHash(receiptHash: string): string {
    return createHmac('sha256', this.getSigningSecret())
      .update(receiptHash)
      .digest('hex');
  }

  verifyReceiptSignature(input: {
    receiptHash: string;
    signature: string;
  }): boolean {
    const expectedSignature = this.signReceiptHash(input.receiptHash);

    return expectedSignature === input.signature;
  }

  private getSigningSecret(): string {
    return (
      process.env.DEKYC_CONNECT_SIGNING_SECRET ??
      process.env.MASTER_SECRET ??
      process.env.JWT_SECRET ??
      'dekyc-dev-connect-signing-secret'
    );
  }
}