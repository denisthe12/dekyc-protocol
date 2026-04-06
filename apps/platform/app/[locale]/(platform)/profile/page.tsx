'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  fetchProfileSummary,
  issueLoginCode,
  rotateLoginCode,
  setupBiometric,
} from '@/lib/api';
import { ProfileSummaryResponse } from '@/lib/types';
import { FaceScanModal } from '@/components/biometric/face-scan-modal';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';

export default function ProfilePage() {
  const t = useTranslations('ProfilePage');

  const [data, setData] = useState<ProfileSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [lastIssuedLoginCode, setLastIssuedLoginCode] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const summary = await fetchProfileSummary();
      setData(summary);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('loadErrorFallback'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleSetupBiometric = async () => {
    if (data?.profileStatus.biometricConfigured) {
      setActionMessage(t('biometricAlreadyConfiguredMessage'));
      return;
    }

    try {
      setBiometricModalOpen(true);
      setBiometricScanning(true);
      setError(null);
      setActionMessage(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('biometricStartError'),
      );
    }
  };

  const handleBiometricScanComplete = async () => {
    try {
      setBiometricModalOpen(false);
      setBiometricScanning(false);
      setError(null);
      setActionMessage(null);

      const generatedMockId = `face-${Date.now()}`;

      await setupBiometric({ biometricMockId: generatedMockId });

      setActionMessage(t('biometricConfiguredSuccess'));
      await loadProfile();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('biometricConfigureError'),
      );
    }
  };

  const handleIssueLoginCode = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setActionMessage(null);

      const result = await issueLoginCode();
      setLastIssuedLoginCode(result.loginCode);
      setActionMessage(t('issueLoginCodeSuccess'));
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('issueLoginCodeError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRotateLoginCode = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setActionMessage(null);

      const result = await rotateLoginCode();
      setLastIssuedLoginCode(result.loginCode);
      setActionMessage(t('rotateLoginCodeSuccess'));
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('rotateLoginCodeError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLoginCode = async () => {
    if (!lastIssuedLoginCode) return;

    await navigator.clipboard.writeText(lastIssuedLoginCode);
    setActionMessage(t('copyLoginCodeSuccess'));
  };

  return (
    <PlatformShell
      title={t('title')}
      description={t('description')}
    >
      <SectionCard
        title={t('accountSummaryTitle')}
        description={t('accountSummaryDescription')}
        actions={
          <button
            onClick={() => void loadProfile()}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            {t('refresh')}
          </button>
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-500">{t('loadingProfile')}</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label={t('metricUserId')} value={data.user.id} />
            <MetricCard label={t('metricEmail')} value={data.user.email} />
            <MetricCard
              label={t('metricEmailVerified')}
              value={data.user.emailVerified ? t('trueValue') : t('falseValue')}
            />
            <MetricCard label={t('metricCreatedAt')} value={data.user.createdAt} />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title={t('onboardingStatusTitle')}
        description={t('onboardingStatusDescription')}
      >
        {loading ? (
          <div className="text-sm text-zinc-500">{t('loadingStatuses')}</div>
        ) : data ? (
          <div className="flex flex-wrap gap-3">
            <StatusBadge
              label={
                data.profileStatus.biometricConfigured
                  ? t('biometricConfigured')
                  : t('biometricNotConfigured')
              }
              tone={
                data.profileStatus.biometricConfigured ? 'success' : 'warning'
              }
            />
            <StatusBadge
              label={
                data.profileStatus.loginCodeConfigured
                  ? t('loginCodeIssued')
                  : t('loginCodeNotIssued')
              }
              tone={
                data.profileStatus.loginCodeConfigured ? 'success' : 'warning'
              }
            />
            <StatusBadge
              label={
                data.profileStatus.edsBound
                  ? t('digitalSignatureConnected')
                  : t('digitalSignatureNotConnected')
              }
              tone={data.profileStatus.edsBound ? 'success' : 'warning'}
            />
            <StatusBadge
              label={data.profileStatus.kycReady ? t('kycReady') : t('kycNotReady')}
              tone={data.profileStatus.kycReady ? 'success' : 'warning'}
            />
            <StatusBadge
              label={data.profileStatus.vaultReady ? t('vaultReady') : t('vaultNotReady')}
              tone={data.profileStatus.vaultReady ? 'success' : 'warning'}
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title={t('biometricSetupTitle')}
        description={t('biometricSetupDescription')}
      >
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="text-sm leading-6 text-zinc-600">
            {t('biometricSetupBody')}
          </div>

          <div className="mt-4">
            <PrimaryButton
              onClick={() => void handleSetupBiometric()}
              disabled={
                actionLoading ||
                biometricScanning ||
                Boolean(data?.profileStatus.biometricConfigured)
              }
            >
              {data?.profileStatus.biometricConfigured
                ? t('biometricAlreadyAdded')
                : biometricScanning
                  ? t('scanningFace')
                  : t('addBiometric')}
            </PrimaryButton>
          </div>
        </div>

        {data?.profileStatus.biometricConfigured ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            {t('biometricAlreadyAddedWarning')}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title={t('loginCodeTitle')}
        description={t('loginCodeDescription')}
      >
        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            onClick={() => void handleIssueLoginCode()}
            disabled={actionLoading || !data?.profileStatus.biometricConfigured}
          >
            {t('issueLoginCode')}
          </PrimaryButton>

          <SecondaryButton
            onClick={() => void handleRotateLoginCode()}
            disabled={actionLoading || !data?.profileStatus.biometricConfigured}
          >
            {t('rotateLoginCode')}
          </SecondaryButton>

          <SecondaryButton
            onClick={() => void handleCopyLoginCode()}
            disabled={!lastIssuedLoginCode}
          >
            {t('copyLastIssuedCode')}
          </SecondaryButton>
        </div>

        {!data?.profileStatus.biometricConfigured ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            {t('configureBiometricFirst')}
          </div>
        ) : null}

        {lastIssuedLoginCode ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              {t('lastIssuedLoginCode')}
            </div>
            <div className="mt-2 break-all text-lg font-semibold text-emerald-900">
              {lastIssuedLoginCode}
            </div>
          </div>
        ) : null}

        {data?.profileStatus.loginCodeIssuedAt ? (
          <div className="mt-4 text-sm text-zinc-600">
            {t('loginCodeIssuedAt')} {data.profileStatus.loginCodeIssuedAt}
          </div>
        ) : null}
      </SectionCard>

      {actionMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {actionMessage}
        </div>
      ) : null}

      <SectionCard
        title={t('latestKycSnapshotTitle')}
        description={t('latestKycSnapshotDescription')}
      >
        {loading ? (
          <div className="text-sm text-zinc-500">{t('loadingKycProfile')}</div>
        ) : !data?.latestKycProfile ? (
          <div className="text-sm text-zinc-500">
            {t('noKycProfileYet')}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label={t('metricFullName')}
              value={data.latestKycProfile.fullName ?? t('emptyValue')}
            />
            <MetricCard
              label={t('metricIin')}
              value={data.latestKycProfile.iin ?? t('emptyValue')}
            />
            <MetricCard
              label={t('metricBirthDate')}
              value={data.latestKycProfile.birthDate ?? t('emptyValue')}
            />
            <MetricCard
              label={t('metricGender')}
              value={data.latestKycProfile.gender ?? t('emptyValue')}
            />
            <MetricCard
              label={t('metricCountry')}
              value={data.latestKycProfile.country ?? t('emptyValue')}
            />
            <MetricCard
              label={t('metricEmail')}
              value={data.latestKycProfile.email ?? t('emptyValue')}
            />
          </div>
        )}
      </SectionCard>

      <FaceScanModal
        open={biometricModalOpen}
        title={t('faceScanTitle')}
        description={t('faceScanDescription')}
        onComplete={() => void handleBiometricScanComplete()}
        onClose={() => {
          setBiometricModalOpen(false);
          setBiometricScanning(false);
        }}
      />
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