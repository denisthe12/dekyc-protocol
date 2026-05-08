import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';

const SUBJECT_ID_PREFIX = 'sub';
const SERVICE_SUBJECT_ID_PREFIX = 'svcsub';
const HASH_LENGTH = 40;

@Injectable()
export class SubjectIdService {
  generateSubjectId(userId: string): string {
    return this.buildPublicId(SUBJECT_ID_PREFIX, [
      userId,
      randomUUID(),
      Date.now().toString(),
    ]);
  }

  generateServiceSubjectId(input: {
    userId: string;
    serviceId: string;
    subjectId: string;
  }): string {
    return this.buildPublicId(SERVICE_SUBJECT_ID_PREFIX, [
      input.userId,
      input.serviceId,
      input.subjectId,
      randomUUID(),
      Date.now().toString(),
    ]);
  }

  private buildPublicId(prefix: string, parts: string[]): string {
    const namespaceSecret = this.getNamespaceSecret();

    const digest = createHash('sha256')
      .update([namespaceSecret, ...parts].join(':'))
      .digest('hex')
      .slice(0, HASH_LENGTH);

    return `${prefix}_${digest}`;
  }

  private getNamespaceSecret(): string {
    return (
      process.env.DEKYC_SUBJECT_NAMESPACE_SECRET ??
      process.env.MASTER_SECRET ??
      process.env.JWT_SECRET ??
      'dekyc-dev-subject-namespace-secret'
    );
  }
}