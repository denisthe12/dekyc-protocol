const { PrismaClient } = require('../prisma/generated/client');
const argon2 = require('argon2');
const { createHash, createHmac } = require('crypto');

const prisma = new PrismaClient();

function canonicalJson(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') return JSON.stringify(value);
  if (typeof value === 'boolean') return JSON.stringify(value);

  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));

    return `{${entries
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalJson(entryValue)}`)
      .join(',')}}`;
  }

  throw new Error(`Unsupported value type: ${typeof value}`);
}

function hashReceipt(payload) {
  return createHash('sha256').update(canonicalJson(payload)).digest('hex');
}

function signReceipt(receiptHash) {
  const secret =
    process.env.DEKYC_CONNECT_SIGNING_SECRET ||
    process.env.MASTER_SECRET ||
    process.env.JWT_SECRET ||
    'dekyc-dev-connect-signing-secret';

  return createHmac('sha256', secret).update(receiptHash).digest('hex');
}

async function main() {
  const clientId = 'svc_connect_test';
  const clientSecret = 'sk_connect_test_secret';
  const serviceSubjectId = 'svcsub_connect_test';
  const subjectId = 'sub_connect_test';
  const consentId = 'consent_connect_test';

  const service = await prisma.service.upsert({
    where: { clientId },
    update: {
      clientSecretHash: await argon2.hash(clientSecret),
      status: 'active',
    },
    create: {
      name: 'Connect Test Service',
      clientId,
      clientSecretHash: await argon2.hash(clientSecret),
      responseSigningSecret: 'resp_connect_test_secret',
      description: 'Temporary service for DeKYC Connect curl tests',
      category: 'test',
      requiredClaims: ['fullName', 'iin', 'birthDate'],
      optionalClaims: ['email', 'verified', 'age18Plus'],
      status: 'active',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'connect-test@dekyc.local' },
    update: {},
    create: {
      email: 'connect-test@dekyc.local',
      passwordHash: 'dev-placeholder-hash',
      emailVerified: true,
    },
  });

  await prisma.deKycSubject.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      subjectId,
    },
  });

  await prisma.deKycServiceSubject.upsert({
    where: {
      userId_serviceId: {
        userId: user.id,
        serviceId: service.id,
      },
    },
    update: {
      subjectId,
      serviceSubjectId,
    },
    create: {
      userId: user.id,
      serviceId: service.id,
      subjectId,
      serviceSubjectId,
    },
  });

  const grantedAt = new Date();
  const signablePayload = {
    consentId,
    serviceId: service.id,
    subjectId,
    serviceSubjectId,
    grantedClaims: ['birthDate', 'fullName', 'iin'],
    consentTextVersion: 'connect-consent-v1',
    grantedAt: grantedAt.toISOString(),
    expiresAt: null,
    revokedAt: null,
    status: 'active',
  };

  const receiptHash = hashReceipt(signablePayload);
  const signature = signReceipt(receiptHash);

  await prisma.deKycConsentReceipt.upsert({
    where: { consentId },
    update: {
      userId: user.id,
      serviceId: service.id,
      subjectId,
      serviceSubjectId,
      grantedClaims: signablePayload.grantedClaims,
      consentTextVersion: signablePayload.consentTextVersion,
      grantedAt,
      expiresAt: null,
      revokedAt: null,
      receiptHash,
      signature,
      status: 'active',
    },
    create: {
      consentId,
      userId: user.id,
      serviceId: service.id,
      subjectId,
      serviceSubjectId,
      grantedClaims: signablePayload.grantedClaims,
      consentTextVersion: signablePayload.consentTextVersion,
      grantedAt,
      expiresAt: null,
      revokedAt: null,
      receiptHash,
      signature,
      status: 'active',
    },
  });

  console.log('');
  console.log('DeKYC Connect test data ready:');
  console.log(`CLIENT_ID=${clientId}`);
  console.log(`CLIENT_SECRET=${clientSecret}`);
  console.log(`CONSENT_ID=${consentId}`);
  console.log(`SERVICE_SUBJECT_ID=${serviceSubjectId}`);
  console.log('');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });