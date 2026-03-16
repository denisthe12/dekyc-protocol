import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

export type EncryptPayloadResult = {
  cipherText: string;
  iv: string;
  authTag: string;
  algorithm: string;
  keyVersion: string;
};

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyVersion = 'v1';

  encryptJson(payload: unknown): EncryptPayloadResult {
    const key = this.getMasterKey();
    const iv = randomBytes(12);

    const cipher = createCipheriv(this.algorithm, key, iv);

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

  decryptJson(input: {
    cipherText: string;
    iv: string;
    authTag: string;
  }): unknown {
    const key = this.getMasterKey();

    const decipher = createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(input.iv, 'base64'),
    );

    decipher.setAuthTag(Buffer.from(input.authTag, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(input.cipherText, 'base64')),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }

  computeKycHash(payload: unknown): string {
    const normalized = JSON.stringify(payload);
    return createHash('sha256').update(normalized).digest('hex');
  }

  private getMasterKey(): Buffer {
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
}