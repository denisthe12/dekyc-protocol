'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { fetchUserOverview } from '@/lib/api';
import { UserOverviewResponse } from '@/lib/types';
import { MetricTile } from '@/components/ui/metric-tile';

export default function OverviewPage() {
  const t = useTranslations('OverviewPage');
  const locale = useLocale();

  const [data, setData] = useState<UserOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchUserOverview();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadErrorFallback'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const progressPercent = useMemo(() => {
    if (!data) return 0;
    return Math.round(
      (data.onboarding.completedSteps / data.onboarding.totalSteps) * 100,
    );
  }, [data]);

  return (
    <PlatformShell
      title={t('title')}
      description={t('description')}
    >
      <SectionCard
        title={t('onboardingTitle')}
        description={t('onboardingDescription')}
        actions={
          <button
            onClick={() => void loadOverview()}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            {t('refresh')}
          </button>
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-500">{t('loadingOverview')}</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-5">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-900">{t('progressLabel')}</span>
                <span className="text-zinc-600">
                  {data.onboarding.completedSteps}/{data.onboarding.totalSteps}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-3 text-sm text-zinc-600">
                {progressPercent}{t('progressCompleted')}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusBadge
                label={
                  data.onboarding.readyForServiceLogin
                    ? t('readyForServiceLogin')
                    : t('setupIncomplete')
                }
                tone={
                  data.onboarding.readyForServiceLogin ? 'success' : 'warning'
                }
              />
              <StatusBadge
                label={t('activePermissions', {
                  count: data.status.activePermissionsCount,
                })}
                tone="neutral"
              />
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-zinc-900">
                {t('serviceReadinessTitle')}
              </div>
              <div className="mt-2 text-sm leading-6 text-zinc-600">
                {data.onboarding.readyForServiceLogin
                  ? t('serviceReadinessReady')
                  : t('serviceReadinessPending')}
              </div>

              {data.onboarding.readyForServiceLogin ? (
                <div className="mt-4">
                  <Link
                    href={`/${locale}/service-login`}
                    className="inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    {t('continueToService')}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title={t('accountStatusTitle')}
        description={t('accountStatusDescription')}
      >
        {loading ? (
          <div className="text-sm text-zinc-500">{t('loadingStatus')}</div>
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatusCard
              title={t('statusEmail')}
              ok={data.user.emailVerified}
              okLabel={t('verified')}
              pendingLabel={t('notVerified')}
            />
            <StatusCard
              title={t('statusBiometric')}
              ok={data.status.biometricConfigured}
              okLabel={t('configured')}
              pendingLabel={t('notConfigured')}
            />
            <StatusCard
              title={t('statusLoginCode')}
              ok={data.status.loginCodeConfigured}
              okLabel={t('issued')}
              pendingLabel={t('notIssued')}
            />
            <StatusCard
              title={t('statusEds')}
              ok={data.status.edsBound}
              okLabel={t('connected')}
              pendingLabel={t('notConnected')}
            />
            <StatusCard
              title={t('statusKyc')}
              ok={data.status.kycReady}
              okLabel={t('ready')}
              pendingLabel={t('notReady')}
            />
            <StatusCard
              title={t('statusVault')}
              ok={data.status.vaultReady}
              okLabel={t('encrypted')}
              pendingLabel={t('notReady')}
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title={t('quickActionsTitle')}
        description={t('quickActionsDescription')}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <QuickAction
            href={`/${locale}/profile`}
            title={t('openProfileTitle')}
            description={t('openProfileDescription')}
          />
          <QuickAction
            href={`/${locale}/platform-kyc`}
            title={t('openKycTitle')}
            description={t('openKycDescription')}
          />
          <QuickAction
            href={`/${locale}/platform-permissions`}
            title={t('openPermissionsTitle')}
            description={t('openPermissionsDescription')}
          />
          <QuickAction
            href={`/${locale}/service-login`}
            title={t('openConsumerServiceTitle')}
            description={t('openConsumerServiceDescription')}
          />
        </div>
      </SectionCard>

      <SectionCard
        title={t('snapshotTitle')}
        description={t('snapshotDescription')}
      >
        {loading ? (
          <div className="text-sm text-zinc-500">{t('loadingSnapshot')}</div>
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricTile label={t('metricEmail')} value={data.user.email} />
            <MetricTile
              label={t('metricLatestFullName')}
              value={data.latestKycProfile?.fullName ?? t('emptyValue')}
            />
            <MetricTile
              label={t('metricLatestIin')}
              value={data.latestKycProfile?.iin ?? t('emptyValue')}
            />
            <MetricTile
              label={t('metricVaultAlgorithm')}
              value={data.latestVaultEntry?.algorithm ?? t('emptyValue')}
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title={t('howItWorksTitle')}
        description={t('howItWorksDescription')}
      >
        <div className="space-y-3 text-sm text-zinc-700">
          <div>{t('howItWorks1')}</div>
          <div>{t('howItWorks2')}</div>
          <div>{t('howItWorks3')}</div>
          <div>{t('howItWorks4')}</div>
          <div>{t('howItWorks5')}</div>
        </div>
      </SectionCard>
    </PlatformShell>
  );
}

function StatusCard({
  title,
  ok,
  okLabel,
  pendingLabel,
}: {
  title: string;
  ok: boolean;
  okLabel: string;
  pendingLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      <div className="mt-3">
        <StatusBadge
          label={ok ? okLabel : pendingLabel}
          tone={ok ? 'success' : 'warning'}
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-zinc-100"
    >
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      <div className="mt-2 text-sm text-zinc-600">{description}</div>
    </Link>
  );
}