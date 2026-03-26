'use client';

import { useMemo, useState, useEffect } from 'react';
import { createNCALayerClient } from '@/lib/ncalayer';

type ChallengeResponse = {
  challengeId: string;
  challengeBase64: string;
  expiresAt: string;
};
type AnalyzeResponse = {
  ok: boolean;
  filePath: string;
  summary: {
    realFieldsForMvp: string[];
    missingFieldsForManualOrMock: string[];
  };
};

type AttestResponse = {
  ok: boolean;
  message: string;
  challengeId: string;
  challengeBase64: string;
  cmsSignatureLength: number;
  cmsSignaturePreview: string | null;
  parsedCertificate: {
    subjectString: string;
    issuerString: string;
    serialNumberHex: string;
    notBefore: string;
    notAfter: string;
    fingerprintSha256: string;
    subjectCommonName: string | null;
    subjectOrganization: string | null;
    subjectOrgUnit: string | null;
    subjectCountry: string | null;
    probableIin: string | null;
  };
  certificateLab: any;
  savedUserCertId: string;
  cmsDebug: {
    normalizedFormat: string;
    detectedKind: string;
    firstBytesHex: string;
    firstTextPreview: string;
    originalLength: string;
    trimmedLength: string;
  };
  receivedAt: string;
  extractedIdentity: {
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    middleName: string | null;
    iin: string | null;
    email: string | null;
    birthDate: string | null;
    gender: 'male' | 'female' | null;
    birthCentury: number | null;
    certificateSerialNumber: string | null;
    certificateFingerprint256: string | null;
    certificateValidFrom: string | null;
    certificateValidTo: string | null;
    certificateIssuer: string | null;
    certificateSubject: string | null;
    rawSubjectFields: Record<string, string>;
    rawIssuerFields: Record<string, string>;
  };
  savedKycProfileId: string;
  savedKycVaultEntryId: string;
  
};

export default function EdsLabPage() {
  const ncalayerClient = useMemo(() => createNCALayerClient(), []);

  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [signing, setSigning] = useState(false);

  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [attestResult, setAttestResult] = useState<AttestResponse | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [meData, setMeData] = useState<{ id: string; email: string } | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connected' | 'failed'
  >('idle');

  const [cmsSignatureBase64, setCmsSignatureBase64] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = window.localStorage.getItem('dekyc_access_token');

    if (savedToken) {
      setAccessToken(savedToken);
    }
  }, []);

  const requestChallenge = async () => {
    try {
      setLoadingChallenge(true);
      setError(null);
      setAttestResult(null);
      setCmsSignatureBase64('');

      const response = await fetch('http://localhost:3001/api/eds/challenge', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Challenge request failed: ${response.status}`);
      }

      const data: ChallengeResponse = await response.json();
      setChallenge(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setLoadingChallenge(false);
    }
  };

    const signup = async () => {
    try {
      setAuthLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(`Signup failed: ${response.status}. Response: ${rawText}`);
      }

      const data = JSON.parse(rawText);
      setAccessToken(data.accessToken);
      setMeData(data.user);
      window.localStorage.setItem('dekyc_access_token', data.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup error');
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async () => {
    try {
      setAuthLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}. Response: ${rawText}`);
      }

      const data = JSON.parse(rawText);
      setAccessToken(data.accessToken);
      setMeData(data.user);
      window.localStorage.setItem('dekyc_access_token', data.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login error');
    } finally {
      setAuthLoading(false);
    }
  };

  const loadMe = async () => {
    if (!accessToken) {
      setError('Сначала выполни signup или login.');
      return;
    }

    try {
      setAuthLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(`Load me failed: ${response.status}. Response: ${rawText}`);
      }

      const data = JSON.parse(rawText);
      console.log('loadMe response:', data);
      setMeData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load me error');
    } finally {
      setAuthLoading(false);
    }
  };

  const connectNCALayer = async () => {
    try {
      setConnecting(true);
      setError(null);

      await ncalayerClient.connect();
      setConnectionStatus('connected');
    } catch (err) {
      setConnectionStatus('failed');
      const message =
        err instanceof Error
          ? `Не удалось подключиться к NCALayer: ${err.message}`
          : 'Не удалось подключиться к NCALayer';
      setError(message);
    } finally {
      setConnecting(false);
    }
  };

  const signChallenge = async () => {
    if (!challenge) {
      setError('Сначала получи challenge.');
      return;
    }

    if (!accessToken) {
      setError('Сначала выполни signup или login.');
      return;
    }

    try {
      setSigning(true);
      setError(null);
      setAttestResult(null);

      const signature = await ncalayerClient.basicsSignCMS(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ncalayerClient.constructor as any).basicsStorageAll,
        challenge.challengeBase64,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ncalayerClient.constructor as any).basicsCMSParamsDetached,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ncalayerClient.constructor as any).basicsSignerSignAny,
      );

      setCmsSignatureBase64(signature);

      const response = await fetch('http://localhost:3001/api/eds/attest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          challengeId: challenge.challengeId,
          challengeBase64: challenge.challengeBase64,
          cmsSignatureBase64: signature,
        }),
      });

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Attest request failed: ${response.status}. Response: ${rawText}`,
        );
      }

      const data: AttestResponse = JSON.parse(rawText);
      setAttestResult(data);
    } catch (err: unknown) {
      const maybeCanceled =
        typeof err === 'object' &&
        err !== null &&
        'canceledByUser' in err &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Boolean((err as any).canceledByUser);

      if (maybeCanceled) {
        setError('Подписание отменено пользователем.');
      } else {
        const message =
          err instanceof Error ? err.message : 'Ошибка во время подписи';
        setError(message);
      }
    } finally {
      setSigning(false);
    }
  };

    const saveAnalysis = async () => {
    if (!attestResult) {
      setError('Сначала подпиши challenge и получи parsedCertificate.');
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/eds/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: attestResult.challengeId,
          parsedCertificate: attestResult.parsedCertificate,
          cmsDebug: attestResult.cmsDebug,
        }),
      });

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Analyze request failed: ${response.status}. Response: ${rawText}`,
        );
      }

      const data: AnalyzeResponse = JSON.parse(rawText);
      setAnalyzeResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка сохранения анализа';
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">EDS Lab</h1>
        <p className="mt-2 text-sm text-gray-600">
          Лабораторная страница для проверки NCALayer → CMS challenge → backend.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">
          What this lab demonstrates
        </div>

        <div className="mt-3 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
          <div>• Platform authentication before EDS binding</div>
          <div>• Challenge generation and CMS signature flow</div>
          <div>• Certificate parsing and identity extraction</div>
          <div>• Persistence into UserCert, KycProfile, and KycVaultEntry</div>
        </div>
      </div>

          <div className="rounded-2xl border p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Platform Auth</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <button
          onClick={signup}
          disabled={authLoading}
          className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {authLoading ? 'Подождите...' : 'Signup'}
        </button>

        <button
          onClick={login}
          disabled={authLoading}
          className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {authLoading ? 'Подождите...' : 'Login'}
        </button>

        <button
          onClick={loadMe}
          disabled={authLoading || !accessToken}
          className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {authLoading ? 'Подождите...' : 'Load me'}
        </button>
      </div>

      {accessToken && (
        <div className="mt-4 text-sm">
          <div className="font-medium">Access token</div>
          <div className="break-all rounded-lg bg-gray-100 p-2">
            {accessToken}
          </div>
        </div>
      )}

      {meData && (
        <div className="mt-4 text-sm">
          <div className="font-medium">Current user</div>
          <div className="rounded-lg bg-gray-100 p-2">
            {meData.email} ({meData.id})
          </div>
        </div>
      )}
    </div>

        <div className="grid gap-4 md:grid-cols-4">
        <button
          onClick={requestChallenge}
          disabled={loadingChallenge}
          className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {loadingChallenge ? 'Запрашиваем...' : '1. Получить challenge'}
        </button>

        <button
          onClick={connectNCALayer}
          disabled={connecting}
          className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {connecting ? 'Подключаем...' : '2. Проверить NCALayer'}
        </button>

        <button
          onClick={signChallenge}
          disabled={signing || !challenge}
          className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {signing ? 'Подписываем...' : '3. Подписать challenge'}
        </button>
                <button
          onClick={saveAnalysis}
          disabled={analyzing || !attestResult}
          className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {analyzing ? 'Сохраняем...' : '4. Сохранить анализ'}
        </button>
      </div>

      <div className="rounded-2xl border p-4">
        <div className="text-sm font-semibold">Статус подключения NCALayer</div>
        <div className="mt-2 text-sm">
          {connectionStatus === 'idle' && 'Ещё не проверяли'}
          {connectionStatus === 'connected' && 'Подключение успешно'}
          {connectionStatus === 'failed' && 'Подключение не удалось'}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {challenge && (
        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Challenge</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="font-medium">challengeId</div>
              <div className="break-all rounded-lg bg-gray-100 p-2">
                {challenge.challengeId}
              </div>
            </div>
            <div>
              <div className="font-medium">challengeBase64</div>
              <div className="break-all rounded-lg bg-gray-100 p-2">
                {challenge.challengeBase64}
              </div>
            </div>
            <div>
              <div className="font-medium">expiresAt</div>
              <div className="break-all rounded-lg bg-gray-100 p-2">
                {challenge.expiresAt}
              </div>
            </div>
          </div>
        </div>
      )}

      {cmsSignatureBase64 && (
        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">CMS подпись</h2>
          <div className="mt-4 text-sm">
            <div className="font-medium">Длина подписи</div>
            <div className="rounded-lg bg-gray-100 p-2">
              {cmsSignatureBase64.length}
            </div>
          </div>
          <div className="mt-3 text-sm">
            <div className="font-medium">Первые символы</div>
            <div className="break-all rounded-lg bg-gray-100 p-2">
              {cmsSignatureBase64.slice(0, 200)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-emerald-900">
            Extracted identity
          </h3>
          <span className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
            IDENTITY EXTRACTED
          </span>
        </div>
        {attestResult &&
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 text-sm">
            <FieldCard label="fullName" value={attestResult.extractedIdentity.fullName} />
            <FieldCard label="firstName" value={attestResult.extractedIdentity.firstName} />
            <FieldCard label="lastName" value={attestResult.extractedIdentity.lastName} />
            <FieldCard label="middleName" value={attestResult.extractedIdentity.middleName} />
            <FieldCard label="iin" value={attestResult.extractedIdentity.iin} />
            <FieldCard label="email" value={attestResult.extractedIdentity.email} />
            <FieldCard label="birthDate" value={attestResult.extractedIdentity.birthDate} />
            <FieldCard label="gender" value={attestResult.extractedIdentity.gender} />
            <FieldCard label="birthCentury" value={attestResult.extractedIdentity.birthCentury?.toString() ?? null} />
          </div>
        }
      </div>

      {attestResult && (
        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Ответ backend</h2>
          <details className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <summary className="cursor-pointer text-base font-semibold text-zinc-900">
              CMS debug
            </summary>

            <div className="mt-3 space-y-3 text-sm">
              <div>
                <div className="font-medium">normalizedFormat</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.cmsDebug.normalizedFormat}
                </div>
              </div>

              <div>
                <div className="font-medium">detectedKind</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.cmsDebug.detectedKind}
                </div>
              </div>

              <div>
                <div className="font-medium">firstBytesHex</div>
                <div className="break-all rounded-lg bg-gray-100 p-2">
                  {attestResult.cmsDebug.firstBytesHex}
                </div>
              </div>

              <div>
                <div className="font-medium">firstTextPreview</div>
                <div className="break-all rounded-lg bg-gray-100 p-2">
                  {attestResult.cmsDebug.firstTextPreview}
                </div>
              </div>

              <div>
                <div className="font-medium">originalLength</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.cmsDebug.originalLength}
                </div>
              </div>

              <div>
                <div className="font-medium">trimmedLength</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.cmsDebug.trimmedLength}
                </div>
              </div>
            </div>
          </details>
          <div className="mt-6">
            <h3 className="text-base font-semibold">Parsed certificate</h3>

            <div className="mt-3 space-y-3 text-sm">
              <div>
                <div className="font-medium">subjectString</div>
                <div className="break-all rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.subjectString}
                </div>
              </div>

              <div>
                <div className="font-medium">issuerString</div>
                <div className="break-all rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.issuerString}
                </div>
              </div>

              <div>
                <div className="font-medium">serialNumberHex</div>
                <div className="break-all rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.serialNumberHex}
                </div>
              </div>

              <div>
                <div className="font-medium">notBefore</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.notBefore}
                </div>
              </div>

              <div>
                <div className="font-medium">notAfter</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.notAfter}
                </div>
              </div>

              <div>
                <div className="font-medium">fingerprintSha256</div>
                <div className="break-all rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.fingerprintSha256}
                </div>
              </div>

              <div>
                <div className="font-medium">subjectCommonName</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.subjectCommonName ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">subjectOrganization</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.subjectOrganization ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">subjectOrgUnit</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.subjectOrgUnit ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">subjectCountry</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.subjectCountry ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">probableIin</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.parsedCertificate.probableIin ?? 'null'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
              <h3 className="text-base font-semibold">What platform saved</h3>
              <p className="mt-2 text-sm text-zinc-600">
                These records show that EDS verification is persisted into the platform domain model.
              </p>

              <div className="mt-3 text-sm">
                <div>
                  <div className="font-medium">savedUserCertId</div>
                  <div className="break-all rounded-lg bg-gray-100 p-2">
                    {attestResult.savedUserCertId}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="font-medium">savedKycProfileId</div>
                <div className="break-all rounded-lg bg-gray-100 p-2">
                  {attestResult.savedKycProfileId}
                </div>
              </div>
              <div>
                <div className="font-medium">savedKycVaultEntryId</div>
                <div className="break-all rounded-lg bg-gray-100 p-2">
                  {attestResult.savedKycVaultEntryId}
                </div>
              </div>
           </div>


            <details className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <summary className="cursor-pointer text-base font-semibold text-zinc-900">
                Certificate LAB (all fields)
              </summary>

              <pre className="mt-4 overflow-x-auto rounded-lg bg-white p-4 text-xs">
                {JSON.stringify(attestResult.certificateLab, null, 2)}
              </pre>
            </details>


          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="font-medium">message</div>
              <div className="rounded-lg bg-gray-100 p-2">
                {attestResult.message}
              </div>
            </div>
            <div>
              <div className="font-medium">cmsSignatureLength</div>
              <div className="rounded-lg bg-gray-100 p-2">
                {attestResult.cmsSignatureLength}
              </div>
            </div>
            <div>
              <div className="font-medium">cmsSignaturePreview</div>
              <div className="break-all rounded-lg bg-gray-100 p-2">
                {attestResult.cmsSignaturePreview}
              </div>
            </div>
            <div>
              <div className="font-medium">receivedAt</div>
              <div className="rounded-lg bg-gray-100 p-2">
                {attestResult.receivedAt}
              </div>
            </div>
          </div>
        </div>
      )}
    {analyzeResult && (
        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Итог анализа этапа 0</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="font-medium">Файл отчёта</div>
              <div className="break-all rounded-lg bg-gray-100 p-2">
                {analyzeResult.filePath}
              </div>
            </div>

            <div>
              <div className="font-medium">Реальные поля для MVP</div>
              <div className="rounded-lg bg-gray-100 p-2">
                {analyzeResult.summary.realFieldsForMvp.join(', ') || '—'}
              </div>
            </div>

            <div>
              <div className="font-medium">Поля, которые уйдут в manual/mock</div>
              <div className="rounded-lg bg-gray-100 p-2">
                {analyzeResult.summary.missingFieldsForManualOrMock.join(', ') || '—'}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">
          How this connects to DeKYC
        </div>

        <div className="mt-3 text-sm leading-6 text-zinc-600">
          After successful EDS verification, the platform extracts identity data,
          saves the certificate record, builds a KYC profile, encrypts it into the vault,
          and later uses it for permission-based signed KYC responses to services.
        </div>
      </div>
    </main>
  );
}

function FieldCard({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-2 break-all text-sm font-semibold text-zinc-900">
        {value ?? 'null'}
      </div>
    </div>
  );
}