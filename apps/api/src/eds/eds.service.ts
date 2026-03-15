import { BadRequestException, ConfigurableModuleBuilder, Injectable } from '@nestjs/common';
import { createHash, randomBytes, randomUUID, X509Certificate } from 'crypto';
import {
  writeFileSync,
  unlinkSync,
  existsSync,
  mkdtempSync,
  readFileSync,
} from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';
import { AttestSignatureDto } from './dto/attest-signature.dto';
import { ParsedCertificateInfo, StoredChallenge } from './eds.types';
import { mkdirSync } from 'fs';
import { SaveAnalysisDto } from './dto/save-analysis.dto';
import { analyzeCertificatePem } from './eds-certificate-lab';
import { Console } from 'console';
import { extractCertificateIdentity } from './eds-certificate-extractor';

export interface EdsChallengeResponse {
  challengeId: string;
  challengeBase64: string;
  expiresAt: string;
}

type NormalizedCmsInput = {
  format: 'DER' | 'PEM' | 'SMIME';
  content: Buffer | string;
  debug: {
    originalLength: number;
    trimmedLength: number;
    detectedKind: string;
    firstBytesHex: string;
    firstTextPreview: string;
  };
};

@Injectable()
export class EdsService {
  private readonly challenges = new Map<string, StoredChallenge>();

  createChallenge(): EdsChallengeResponse {
    const challengeId = randomUUID();
    const challengeBytes = randomBytes(32);
    const challengeBase64 = challengeBytes.toString('base64');
    const expiresAtMs = Date.now() + 5 * 60 * 1000;

    this.challenges.set(challengeId, {
      challengeId,
      challengeBase64,
      expiresAt: expiresAtMs,
    });

    return {
      challengeId,
      challengeBase64,
      expiresAt: new Date(expiresAtMs).toISOString(),
    };
  }

  attestSignature(payload: AttestSignatureDto) {
    const stored = this.challenges.get(payload.challengeId);

    if (!stored) {
      throw new BadRequestException('Challenge not found');
    }

    if (Date.now() > stored.expiresAt) {
      this.challenges.delete(payload.challengeId);
      throw new BadRequestException('Challenge expired');
    }

    if (stored.challengeBase64 !== payload.challengeBase64) {
      throw new BadRequestException('Challenge mismatch');
    }

    const result = this.extractCertificateInfoFromCms(payload.cmsSignatureBase64);
    const extractedIdentity = extractCertificateIdentity(result.certificateLab);

    return {
      ok: true,
      message: 'CMS signature received and certificate parsed',
      challengeId: payload.challengeId,
      challengeBase64: payload.challengeBase64,
      cmsSignatureLength: payload.cmsSignatureBase64.length,
      parsedCertificate: result.parsedCertificate,
      cmsDebug: result.cmsDebug,
      receivedAt: new Date().toISOString(),
      extractedIdentity,
    };
  }

    saveAnalysis(payload: SaveAnalysisDto) {
    const reportsDir = join(process.cwd(), 'reports');
    mkdirSync(reportsDir, { recursive: true });

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const filePath = join(
      reportsDir,
      `eds-analysis-${timestamp}-${payload.challengeId}.json`,
    );

    const mvpFieldMatrix = [
      {
        field: 'full_name',
        source: 'subjectString / CN',
        found: Boolean(payload.parsedCertificate.subjectCommonName),
        value: payload.parsedCertificate.subjectCommonName,
        useInMvp: true,
        note: 'Основной кандидат на ФИО для MVP',
      },
      {
        field: 'iin',
        source: 'subjectString regex(12 digits)',
        found: Boolean(payload.parsedCertificate.probableIin),
        value: payload.parsedCertificate.probableIin,
        useInMvp: true,
        note: 'Использовать только если стабильно извлекается',
      },
      {
        field: 'certificate_fingerprint',
        source: 'X509 raw cert -> sha256',
        found: Boolean(payload.parsedCertificate.fingerprintSha256),
        value: payload.parsedCertificate.fingerprintSha256,
        useInMvp: true,
        note: 'Надёжный технический идентификатор сертификата',
      },
      {
        field: 'certificate_serial',
        source: 'X509 serial',
        found: Boolean(payload.parsedCertificate.serialNumberHex),
        value: payload.parsedCertificate.serialNumberHex,
        useInMvp: true,
        note: 'Подходит для UserCert и аудита',
      },
      {
        field: 'certificate_valid_from',
        source: 'X509 validFrom',
        found: Boolean(payload.parsedCertificate.notBefore),
        value: payload.parsedCertificate.notBefore,
        useInMvp: true,
        note: 'Полезно для профиля и валидации сертификата',
      },
      {
        field: 'certificate_valid_to',
        source: 'X509 validTo',
        found: Boolean(payload.parsedCertificate.notAfter),
        value: payload.parsedCertificate.notAfter,
        useInMvp: true,
        note: 'Полезно для проверки срока действия',
      },
      {
        field: 'issuer',
        source: 'X509 issuer',
        found: Boolean(payload.parsedCertificate.issuerString),
        value: payload.parsedCertificate.issuerString,
        useInMvp: true,
        note: 'Важно для аудита и показа источника сертификата',
      },
      {
        field: 'organization',
        source: 'subjectString / O',
        found: Boolean(payload.parsedCertificate.subjectOrganization),
        value: payload.parsedCertificate.subjectOrganization,
        useInMvp: false,
        note: 'Скорее вспомогательное поле',
      },
      {
        field: 'org_unit',
        source: 'subjectString / OU',
        found: Boolean(payload.parsedCertificate.subjectOrgUnit),
        value: payload.parsedCertificate.subjectOrgUnit,
        useInMvp: false,
        note: 'Скорее вспомогательное поле',
      },
      {
        field: 'country',
        source: 'subjectString / C',
        found: Boolean(payload.parsedCertificate.subjectCountry),
        value: payload.parsedCertificate.subjectCountry,
        useInMvp: false,
        note: 'Не критично для MVP KYC',
      },
      {
        field: 'birth_date',
        source: 'not found from current cert parser',
        found: false,
        value: null,
        useInMvp: false,
        note: 'Нужен manual/mock, если не извлекается отдельно',
      },
      {
        field: 'residential_address',
        source: 'not found from current cert parser',
        found: false,
        value: null,
        useInMvp: false,
        note: 'Нужен manual/mock, если не извлекается отдельно',
      },
    ];

    const report = {
      savedAt: now.toISOString(),
      challengeId: payload.challengeId,
      parsedCertificate: payload.parsedCertificate,
      cmsDebug: payload.cmsDebug,
      mvpFieldMatrix,
      conclusion: {
        realFieldsForMvp: mvpFieldMatrix
          .filter((item) => item.useInMvp && item.found)
          .map((item) => item.field),
        missingFieldsForManualOrMock: mvpFieldMatrix
          .filter((item) => !item.found)
          .map((item) => item.field),
      },
    };

    writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');

    return {
      ok: true,
      filePath,
      summary: report.conclusion,
    };
  }

  private extractCertificateInfoFromCms(cmsSignatureBase64: string): {
    parsedCertificate: ParsedCertificateInfo;
    cmsDebug: Record<string, string>;
    certificateLab: any;
  } {
    const tempDir = mkdtempSync(join(tmpdir(), 'dekyc-eds-'));
    const inputPath = join(tempDir, 'input.cms');
    const certsPemPath = join(tempDir, 'certs.pem');

    try {
      const normalized = this.normalizeCmsInput(cmsSignatureBase64);

      if (normalized.format === 'DER') {
        writeFileSync(inputPath, normalized.content as Buffer);
      } else {
        writeFileSync(inputPath, normalized.content as string, 'utf8');
      }

      const informArg =
        normalized.format === 'DER'
          ? 'DER'
          : normalized.format === 'PEM'
            ? 'PEM'
            : 'SMIME';

      execFileSync(
        'openssl',
        [
          'cms',
          '-cmsout',
          '-inform',
          informArg,
          '-in',
          inputPath,
          '-certsout',
          certsPemPath,
          '-out',
          '/dev/null',
        ],
        { stdio: 'pipe' },
      );

      const certsPem = readFileSync(certsPemPath, 'utf8');
      const firstCertPem = this.extractFirstCertificatePem(certsPem);

      if (!firstCertPem) {
        throw new Error('No PEM certificate extracted from CMS');
      }

      const x509 = new X509Certificate(firstCertPem);
      const labResult = analyzeCertificatePem(firstCertPem);
      console.log(JSON.stringify(labResult, null, 2));

      const subjectString = x509.subject;
      const issuerString = x509.issuer;
      const serialNumberHex = x509.serialNumber;
      const notBefore = new Date(x509.validFrom).toISOString();
      const notAfter = new Date(x509.validTo).toISOString();

      const fingerprintSha256 = createHash('sha256')
        .update(x509.raw)
        .digest('hex');

      const subjectCommonName = this.extractDnField(subjectString, 'CN');
      const subjectOrganization = this.extractDnField(subjectString, 'O');
      const subjectOrgUnit = this.extractDnField(subjectString, 'OU');
      const subjectCountry = this.extractDnField(subjectString, 'C');
      const probableIin = this.extractProbableIin(subjectString);

      return {
        parsedCertificate: {
          subjectString,
          issuerString,
          serialNumberHex,
          notBefore,
          notAfter,
          fingerprintSha256,
          subjectCommonName,
          subjectOrganization,
          subjectOrgUnit,
          subjectCountry,
          probableIin,
        },
        certificateLab: labResult,
        cmsDebug: {
          normalizedFormat: normalized.format,
          detectedKind: normalized.debug.detectedKind,
          firstBytesHex: normalized.debug.firstBytesHex,
          firstTextPreview: normalized.debug.firstTextPreview,
          originalLength: String(normalized.debug.originalLength),
          trimmedLength: String(normalized.debug.trimmedLength),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CMS certificate: ${
          error instanceof Error ? error.message : 'Unknown parse error'
        }`,
      );
    } finally {
      if (existsSync(inputPath)) unlinkSync(inputPath);
      if (existsSync(certsPemPath)) unlinkSync(certsPemPath);
    }
  }

  private normalizeCmsInput(input: string): NormalizedCmsInput {
    const trimmed = input.trim();
    const originalLength = input.length;
    const trimmedLength = trimmed.length;

    // 1) Уже PEM/CMS/PKCS7 текст
    if (trimmed.includes('-----BEGIN')) {
      return {
        format: 'PEM',
        content: trimmed,
        debug: {
          originalLength,
          trimmedLength,
          detectedKind: 'direct-pem-text',
          firstBytesHex: Buffer.from(trimmed.slice(0, 32), 'utf8').toString('hex'),
          firstTextPreview: trimmed.slice(0, 120),
        },
      };
    }

    // 2) Пробуем base64 decode
    let decoded = Buffer.alloc(0);
    try {
      decoded = Buffer.from(trimmed, 'base64');
    } catch {
      // ignore
    }

    const firstBytesHex = decoded.subarray(0, 16).toString('hex');
    const decodedTextPreview = decoded.subarray(0, 120).toString('utf8');

    // 2a) base64 -> PEM text
    if (decodedTextPreview.includes('-----BEGIN')) {
      return {
        format: 'PEM',
        content: decoded.toString('utf8'),
        debug: {
          originalLength,
          trimmedLength,
          detectedKind: 'base64-of-pem-text',
          firstBytesHex,
          firstTextPreview: decodedTextPreview,
        },
      };
    }

    // 2b) base64 -> S/MIME text
    if (
      decodedTextPreview.includes('MIME-Version:') ||
      decodedTextPreview.includes('Content-Type:')
    ) {
      return {
        format: 'SMIME',
        content: decoded.toString('utf8'),
        debug: {
          originalLength,
          trimmedLength,
          detectedKind: 'base64-of-smime-text',
          firstBytesHex,
          firstTextPreview: decodedTextPreview,
        },
      };
    }

    // 2c) base64 -> ASN.1 DER, обычно начинается с 0x30
    if (decoded.length > 4 && decoded[0] === 0x30) {
      return {
        format: 'DER',
        content: decoded,
        debug: {
          originalLength,
          trimmedLength,
          detectedKind: 'base64-of-der',
          firstBytesHex,
          firstTextPreview: decodedTextPreview,
        },
      };
    }

    // 3) В крайнем случае пробуем считать как S/MIME text как есть
    return {
      format: 'SMIME',
      content: trimmed,
      debug: {
        originalLength,
        trimmedLength,
        detectedKind: 'raw-text-fallback',
        firstBytesHex: Buffer.from(trimmed.slice(0, 32), 'utf8').toString('hex'),
        firstTextPreview: trimmed.slice(0, 120),
      },
    };
  }

  private extractFirstCertificatePem(pemBundle: string): string | null {
    const match = pemBundle.match(
      /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/,
    );

    return match?.[0] ?? null;
  }

  private extractDnField(
    dn: string,
    field: 'CN' | 'O' | 'OU' | 'C',
  ): string | null {
    const regex = new RegExp(
      `(?:^|\\n|\\r|,|/)\\s*${field}\\s*=\\s*([^,\\n\\r/]+)`,
    );
    const match = dn.match(regex);
    return match?.[1]?.trim() ?? null;
  }

  private extractProbableIin(dn: string): string | null {
    const twelveDigits = dn.match(/\b\d{12}\b/);
    return twelveDigits?.[0] ?? null;
  }
}