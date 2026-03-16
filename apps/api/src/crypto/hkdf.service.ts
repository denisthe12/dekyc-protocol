import { Injectable } from '@nestjs/common';
import { createHmac, hkdfSync } from 'crypto';
import { getRequiredEnv } from '../config/env';

@Injectable()
export class HkdfService {
  private readonly masterSecret: Buffer;

  constructor() {
    this.masterSecret = Buffer.from(getRequiredEnv('MASTER_SECRET'), 'utf8');
  }

  derivePermissionKey(params: {
    permissionId: string;
    serviceId: string;
    userId: string;
    version?: number;
  }): string {
    const version = params.version ?? 1;

    const userHash = createHmac('sha256', this.masterSecret)
      .update(params.userId)
      .digest('hex');

    const context = Buffer.from(
      `permission:${params.permissionId}|service:${params.serviceId}|user:${userHash}|v:${version}`,
      'utf8',
    );

    const key = hkdfSync(
      'sha256',
      this.masterSecret,
      Buffer.alloc(0),
      context,
      32,
    );

    return Buffer.from(key).toString('hex');
  }
}