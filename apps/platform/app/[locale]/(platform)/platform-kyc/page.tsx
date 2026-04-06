'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { fetchKycSummary } from '@/lib/api';
import { KycSummaryResponse } from '@/lib/types';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { runPlatformEdsFlow, RunPlatformEdsFlowResult } from '@/lib/eds/eds-flow';

export default function PlatformKycPage() {
  const t = useTranslations('PlatformKycPage');

  const [data, setData] = useState<KycSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingSignature, setConnectingSignature] = useState(false);
  const [signatureFlowError, setSignatureFlowError] = useState<string | null>(null);
  const [signatureFlowMessage, setSignatureFlowMessage] = useState<string | null>(null);
  const [lastEdsFlowResult, setLastEdsFlowResult] =
    useState<RunPlatformEdsFlowResult | null>(null);

  const loadKycSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const summary = await fetchKycSummary();
      setData(summary);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('loadErrorFallback'),
      );
    } finally {
      setLoading(false);
    }
  };

  const isDigitalSignatureAlreadyConnected =
    Boolean(data?.eds.connected) || Boolean(data?.kyc.ready);

  useEffect(() => {
    void loadKycSummary();
  }, []);

  const handleConnectDigitalSignature = async () => {
    if (isDigitalSignatureAlreadyConnected) {
      setSignatureFlowError(t('signatureAlreadyConnectedError'));
      return;
    }

    try {
      setConnectingSignature(true);
      setSignatureFlowError(null);
      setSignatureFlowMessage(null);

      const result = await runPlatformEdsFlow();

      setLastEdsFlowResult(result);
      setSignatureFlowMessage(t('signatureConnectedSuccess'));

      await loadKycSummary();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('connectSignatureError');

      setSignatureFlowError(message);
    } finally {
      setConnectingSignature(false);
    }
  };

  return (
    <PlatformShell
      title={t('title')}
      description={t('description')}
    >
      <SectionCard
        title={t('gatingTitle')}
        description={t('gatingDescription')}
        actions={
          <button
            onClick={() => void loadKycSummary()}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            {t('refresh')}
          </button>
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-500">{t('loadingKycStatus')}</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <StatusBadge
                label={
                  data.gating.biometricConfigured
                    ? t('biometricConfigured')
                    : t('biometricRequired')
                }
                tone={
                  data.gating.biometricConfigured ? 'success' : 'warning'
                }
              />
              <StatusBadge
                label={
                  data.eds.connected
                    ? t('digitalSignatureConnected')
                    : t('digitalSignatureNotConnected')
                }
                tone={data.eds.connected ? 'success' : 'warning'}
              />
              <StatusBadge
                label={data.kyc.ready ? t('kycReady') : t('kycNotReady')}
                tone={data.kyc.ready ? 'success' : 'warning'}
              />
              <StatusBadge
                label={data.vault.ready ? t('vaultReady') : t('vaultNotReady')}
                tone={data.vault.ready ? 'success' : 'warning'}
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-sm text-zinc-700">
                {t('gatingBody')}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <PrimaryButton
                  onClick={() => void handleConnectDigitalSignature()}
                  disabled={connectingSignature || isDigitalSignatureAlreadyConnected}
                >
                  {isDigitalSignatureAlreadyConnected
                    ? t('digitalSignatureAlreadyConnected')
                    : connectingSignature
                      ? t('connectingDigitalSignature')
                      : t('connectDigitalSignature')}
                </PrimaryButton>

                <SecondaryButton onClick={() => void loadKycSummary()}>
                  {t('refreshKycStatus')}
                </SecondaryButton>
              </div>

              <div className="mt-3 text-xs text-zinc-500">
                {t('afterVerificationHint')}
              </div>

              {isDigitalSignatureAlreadyConnected ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  {t('rebindWarning')}
                </div>
              ) : null}
            </div>

            {signatureFlowError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {signatureFlowError.includes('NCALayer')
                  ? t('ncaLayerNotRunning')
                  : signatureFlowError}
              </div>
            ) : null}

            {signatureFlowMessage ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {signatureFlowMessage}
              </div>
            ) : null}

            {lastEdsFlowResult ? (
              <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-zinc-900">
                  {t('latestConnectionTitle')}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <MetricCard
                    label={t('metricChallengeId')}
                    value={lastEdsFlowResult.challenge.challengeId}
                  />
                  <MetricCard
                    label={t('metricChallengeBase64')}
                    value={lastEdsFlowResult.challenge.challengeBase64}
                  />
                  <MetricCard
                    label={t('metricAnalyzeResult')}
                    value={lastEdsFlowResult.analyzeResult ? t('analyzeSaved') : t('analyzeProcessed')}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title={t('verifiedProfileTitle')}
        description={t('verifiedProfileDescription')}
      >
        {loading ? (
          <div className="text-sm text-zinc-500">{t('loadingProfile')}</div>
        ) : !data?.kyc.profile ? (
          <EmptyState
            title={t('noKycProfileTitle')}
            description={t('noKycProfileDescription')}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard label={t('metricFullName')} value={data.kyc.profile.fullName ?? t('emptyValue')} />
            <MetricCard label={t('metricFirstName')} value={data.kyc.profile.firstName ?? t('emptyValue')} />
            <MetricCard label={t('metricLastName')} value={data.kyc.profile.lastName ?? t('emptyValue')} />
            <MetricCard label={t('metricMiddleName')} value={data.kyc.profile.middleName ?? t('emptyValue')} />
            <MetricCard label={t('metricIin')} value={data.kyc.profile.iin ?? t('emptyValue')} />
            <MetricCard label={t('metricEmail')} value={data.kyc.profile.email ?? t('emptyValue')} />
            <MetricCard label={t('metricBirthDate')} value={data.kyc.profile.birthDate ?? t('emptyValue')} />
            <MetricCard label={t('metricGender')} value={data.kyc.profile.gender ?? t('emptyValue')} />
            <MetricCard label={t('metricCountry')} value={data.kyc.profile.country ?? t('emptyValue')} />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={t('securityTitle')}
        description={t('securityDescription')}
      >
        {loading ? (
          <div className="text-sm text-zinc-500">{t('loadingSecurityStatus')}</div>
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label={t('metricEdsBound')}
              value={data.eds.connected ? t('yes') : t('no')}
            />
            <MetricCard
              label={t('metricVaultEncrypted')}
              value={data.vault.ready ? t('yes') : t('no')}
            />
            <MetricCard
              label={t('metricVaultAlgorithm')}
              value={data.vault.entry?.algorithm ?? t('emptyValue')}
            />
          </div>
        ) : null}
      </SectionCard>
    </PlatformShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-2 break-all text-sm font-semibold text-zinc-900">
        {value}
      </div>
    </div>
  );
}