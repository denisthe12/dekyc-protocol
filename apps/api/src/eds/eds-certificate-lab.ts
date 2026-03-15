import { X509Certificate } from 'crypto';
import { execFileSync } from 'child_process';
import { mkdtempSync, readFileSync, unlinkSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export type CertificateLabResult = {
  nodeX509: {
    ownPropertyNames: string[];
    prototypePropertyNames: string[];
    enumerableSnapshot: Record<string, unknown>;
  };

  parsedNames: {
    subjectRaw: string;
    issuerRaw: string;
    subjectFields: Record<string, string>;
    issuerFields: Record<string, string>;
    subjectLines: string[];
    issuerLines: string[];
  };

  openssl: {
    text: string;
    subject: string;
    issuer: string;
    serial: string;
    dates: string;
    email: string;
    ocspUri: string;
    fingerprintSha256: string;
  };
};

export function analyzeCertificatePem(pem: string): CertificateLabResult {
  const cert = new X509Certificate(pem);

  const ownPropertyNames = Object.getOwnPropertyNames(cert);
  const prototypePropertyNames = Object.getOwnPropertyNames(
    Object.getPrototypeOf(cert),
  );

  const enumerableSnapshot = safeSnapshot(cert);

  const subjectRaw = cert.subject;
  const issuerRaw = cert.issuer;

  const subjectLines = splitDnLines(subjectRaw);
  const issuerLines = splitDnLines(issuerRaw);

  const subjectFields = parseDnLines(subjectRaw);
  const issuerFields = parseDnLines(issuerRaw);

  const openssl = getOpenSslCertificateDump(pem);

  return {
    nodeX509: {
      ownPropertyNames,
      prototypePropertyNames,
      enumerableSnapshot,
    },
    parsedNames: {
      subjectRaw,
      issuerRaw,
      subjectFields,
      issuerFields,
      subjectLines,
      issuerLines,
    },
    openssl,
  };
}

function safeSnapshot(cert: X509Certificate): Record<string, unknown> {
  const keys = [
    'subject',
    'issuer',
    'subjectAltName',
    'infoAccess',
    'validFrom',
    'validTo',
    'validFromDate',
    'validToDate',
    'fingerprint',
    'fingerprint256',
    'fingerprint512',
    'serialNumber',
    'keyUsage',
    'ca',
    'raw',
    'publicKey',
    'toString',
    'toJSON',
  ];

  const result: Record<string, unknown> = {};

  for (const key of keys) {
    try {
      const value = (cert as unknown as Record<string, unknown>)[key];

      if (Buffer.isBuffer(value)) {
        result[key] = {
          type: 'Buffer',
          length: value.length,
          hexPreview: value.subarray(0, 32).toString('hex'),
        };
        continue;
      }

      if (typeof value === 'function') {
        result[key] = '[function]';
        continue;
      }

      if (value && typeof value === 'object') {
        result[key] = Object.prototype.toString.call(value);
        continue;
      }

      result[key] = value ?? null;
    } catch (error) {
      result[key] =
        error instanceof Error ? `[error] ${error.message}` : '[error]';
    }
  }

  return result;
}

function splitDnLines(dn: string): string[] {
  return dn
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseDnLines(dn: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = splitDnLines(dn);

  for (const line of lines) {
    const idx = line.indexOf('=');

    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();

    fields[key] = value;
  }

  return fields;
}

function getOpenSslCertificateDump(pem: string) {
  const tempDir = mkdtempSync(join(tmpdir(), 'dekyc-cert-lab-'));
  const certPath = join(tempDir, 'cert.pem');

  try {
    writeFileSync(certPath, pem, 'utf8');

    const text = execFileSync(
      'openssl',
      ['x509', '-in', certPath, '-text', '-noout', '-certopt', 'ext_parse,ext_dump'],
      { encoding: 'utf8', stdio: 'pipe' },
    );

    const subject = execFileSync(
      'openssl',
      ['x509', '-in', certPath, '-subject', '-noout'],
      { encoding: 'utf8', stdio: 'pipe' },
    );

    const issuer = execFileSync(
      'openssl',
      ['x509', '-in', certPath, '-issuer', '-noout'],
      { encoding: 'utf8', stdio: 'pipe' },
    );

    const serial = execFileSync(
      'openssl',
      ['x509', '-in', certPath, '-serial', '-noout'],
      { encoding: 'utf8', stdio: 'pipe' },
    );

    const dates = execFileSync(
      'openssl',
      ['x509', '-in', certPath, '-dates', '-noout'],
      { encoding: 'utf8', stdio: 'pipe' },
    );

    const email = execFileSync(
      'openssl',
      ['x509', '-in', certPath, '-email', '-noout'],
      { encoding: 'utf8', stdio: 'pipe' },
    );

    const ocspUri = execFileSync(
      'openssl',
      ['x509', '-in', certPath, '-ocsp_uri', '-noout'],
      { encoding: 'utf8', stdio: 'pipe' },
    );

    const fingerprintSha256 = execFileSync(
      'openssl',
      ['x509', '-in', certPath, '-fingerprint', '-sha256', '-noout'],
      { encoding: 'utf8', stdio: 'pipe' },
    );

    return {
      text: text.trim(),
      subject: subject.trim(),
      issuer: issuer.trim(),
      serial: serial.trim(),
      dates: dates.trim(),
      email: email.trim(),
      ocspUri: ocspUri.trim(),
      fingerprintSha256: fingerprintSha256.trim(),
    };
  } finally {
    if (existsSync(certPath)) {
      unlinkSync(certPath);
    }
  }
}