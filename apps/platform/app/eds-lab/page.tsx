'use client';

import { useMemo, useState } from 'react';
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

  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connected' | 'failed'
  >('idle');

  const [cmsSignatureBase64, setCmsSignatureBase64] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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

      {attestResult && (
        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Ответ backend</h2>
          <div className="mt-6">
            <h3 className="text-base font-semibold">CMS debug</h3>

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
          </div>
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
                      <div className="mt-6">
            <h3 className="text-base font-semibold">Extracted identity</h3>

            <div className="mt-3 space-y-3 text-sm">
              <div>
                <div className="font-medium">fullName</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.extractedIdentity.fullName ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">firstName</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.extractedIdentity.firstName ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">lastName</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.extractedIdentity.lastName ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">middleName</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.extractedIdentity.middleName ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">iin</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.extractedIdentity.iin ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">email</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.extractedIdentity.email ?? 'null'}
                </div>
              </div>
              <div>
              <div className="font-medium">birthDate</div>
              <div className="rounded-lg bg-gray-100 p-2">
                {attestResult.extractedIdentity.birthDate ?? 'null'}
              </div>
            </div>

            <div>
              <div className="font-medium">gender</div>
              <div className="rounded-lg bg-gray-100 p-2">
                {attestResult.extractedIdentity.gender ?? 'null'}
              </div>
            </div>

            <div>
              <div className="font-medium">birthCentury</div>
              <div className="rounded-lg bg-gray-100 p-2">
                {attestResult.extractedIdentity.birthCentury ?? 'null'}
              </div>
            </div>

              <div>
                <div className="font-medium">certificateFingerprint256</div>
                <div className="break-all rounded-lg bg-gray-100 p-2">
                  {attestResult.extractedIdentity.certificateFingerprint256 ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">certificateValidFrom</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.extractedIdentity.certificateValidFrom ?? 'null'}
                </div>
              </div>

              <div>
                <div className="font-medium">certificateValidTo</div>
                <div className="rounded-lg bg-gray-100 p-2">
                  {attestResult.extractedIdentity.certificateValidTo ?? 'null'}
                </div>
              </div>
            </div>
          </div>
          </div>
          <div className="mt-6">
            <h3 className="text-base font-semibold">Certificate LAB (all fields)</h3>

            <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-100 p-4 text-xs">
                {JSON.stringify(attestResult.certificateLab, null, 2)}
            </pre>
            </div>
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
    </main>
  );
}