import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import type { DeKycIdentityAssertionPayload } from '@energy/shared';
import {
  decodeBase64UrlJson,
  encodeBase64Url,
} from './utils/base64url';

interface JwsHeader {
  alg: 'HS256';
  typ: 'JWT';
  kid: string;
}

interface ParsedJws {
  header: JwsHeader;
  payload: DeKycIdentityAssertionPayload;
  signingInput: string;
  signature: string;
}

@Injectable()
export class IdentityAssertionsSigner {
  signPayload(payload: DeKycIdentityAssertionPayload): string {
    const header: JwsHeader = {
      alg: 'HS256',
      typ: 'JWT',
      kid: this.getKeyId(),
    };

    const encodedHeader = encodeBase64Url(JSON.stringify(header));
    const encodedPayload = encodeBase64Url(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = this.signSigningInput(signingInput);

    return `${signingInput}.${signature}`;
  }

  verifyAndDecode(assertionJws: string): {
    valid: boolean;
    reason: string | null;
    payload: DeKycIdentityAssertionPayload | null;
  } {
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

  private parseJws(assertionJws: string): ParsedJws | null {
    const parts = assertionJws.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }

    try {
      const header = decodeBase64UrlJson<JwsHeader>(encodedHeader);
      const payload =
        decodeBase64UrlJson<DeKycIdentityAssertionPayload>(encodedPayload);

      if (!this.isAssertionPayload(payload)) {
        return null;
      }

      return {
        header,
        payload,
        signingInput: `${encodedHeader}.${encodedPayload}`,
        signature,
      };
    } catch {
      return null;
    }
  }

  private signSigningInput(signingInput: string): string {
    const signature = createHmac('sha256', this.getSigningSecret())
      .update(signingInput)
      .digest();

    return encodeBase64Url(signature);
  }

  private safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }

  private isAssertionPayload(
    value: unknown,
  ): value is DeKycIdentityAssertionPayload {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const payload = value as Record<string, unknown>;

    return (
      typeof payload.iss === 'string' &&
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
      typeof payload.exp === 'number'
    );
  }

  private getSigningSecret(): string {
    return (
      process.env.DEKYC_CONNECT_SIGNING_SECRET ??
      process.env.MASTER_SECRET ??
      process.env.JWT_SECRET ??
      'dekyc-dev-connect-signing-secret'
    );
  }

  private getKeyId(): string {
    return process.env.DEKYC_CONNECT_KEY_ID ?? 'dekyc-connect-hs256-v1';
  }
}