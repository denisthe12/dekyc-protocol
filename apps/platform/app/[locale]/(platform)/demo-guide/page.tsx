'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {PlatformShell} from '@/components/platform/platform-shell';
import {SectionCard} from '@/components/dashboard/section-card';
import {fetchUserOverview} from '@/lib/api';
import {EmptyState} from '@/components/ui/empty-state';
import {MetricTile} from '@/components/ui/metric-tile';
import {PrimaryButton, SecondaryButton} from '@/components/ui/buttons';
import {ActionBar} from '@/components/ui/action-bar';

import type {UserOverviewResponse} from '@/lib/types';

type StepStatus = 'done' | 'pending';

type Step = {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  href: string;
  cta: string;
};

export default function DemoGuidePage() {
  const t = useTranslations('DemoGuidePage');

  const [overview, setOverview] = useState<UserOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    try {
      setError(null);
      const data = await fetchUserOverview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadingErrorFallback'));
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const steps = buildSteps(overview, t);

  const completedSteps = useMemo(
    () => steps.filter((step) => step.status === 'done').length,
    [steps],
  );

  const progressPercent = useMemo(() => {
    if (steps.length === 0) return 0;
    return Math.round((completedSteps / steps.length) * 100);
  }, [completedSteps, steps.length]);

  return (
    <PlatformShell
      title={t('title')}
      description={t('description')}
    >
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">
          {t('introTitle')}
        </div>

        <div className="mt-3 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
          <div>• {t('introPoint1')}</div>
          <div>• {t('introPoint2')}</div>
          <div>• {t('introPoint3')}</div>
          <div>• {t('introPoint4')}</div>
        </div>
      </div>

      <SectionCard
        title={t('progressTitle')}
        description={t('progressDescription')}
      >
        {!overview ? (
          error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <EmptyState
              title={t('loadingTitle')}
              description={t('loadingDescription')}
            />
          )
        ) : (
          <div className="space-y-5">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-900">{t('guideCompletion')}</span>
                <span className="text-zinc-600">
                  {completedSteps}/{steps.length}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all"
                  style={{width: `${progressPercent}%`}}
                />
              </div>

              <div className="mt-3 text-sm text-zinc-600">
                {progressPercent}{t('guideCompletionSuffix')}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricTile
                label={t('metricUserEmail')}
                value={overview.user.email}
              />
              <MetricTile
                label={t('metricActivePermissions')}
                value={String(overview.status.activePermissionsCount)}
              />
              <MetricTile
                label={t('metricKycReady')}
                value={overview.status.kycReady ? t('yes') : t('no')}
              />
              <MetricTile
                label={t('metricServiceLoginReady')}
                value={overview.onboarding.readyForServiceLogin ? t('yes') : t('no')}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <ActionBar
        title={t('presentationOrderTitle')}
        description={t('presentationOrderDescription')}
        actions={
          <SecondaryButton onClick={() => void loadOverview()}>
            {t('refreshStatus')}
          </SecondaryButton>
        }
      />

      <div className="space-y-6">
        {steps.length === 0 ? (
          <EmptyState
            title={t('noStepsTitle')}
            description={t('noStepsDescription')}
          />
        ) : (
          steps.map((step, index) => (
            <SectionCard
              key={step.id}
              title={`${index + 1}. ${step.title}`}
              description={step.description}
              actions={<Status status={step.status} />}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm leading-6 text-zinc-600">
                  {step.status === 'done'
                    ? t('stepDoneBody')
                    : t('stepPendingBody')}
                </div>

                <Link href={step.href}>
                  {step.status === 'done' ? (
                    <PrimaryButton>{step.cta}</PrimaryButton>
                  ) : (
                    <SecondaryButton>{step.cta}</SecondaryButton>
                  )}
                </Link>
              </div>
            </SectionCard>
          ))
        )}
      </div>

      <SectionCard
        title={t('readFlowTitle')}
        description={t('readFlowDescription')}
      >
        <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
          <div>• {t('readFlowPoint1')}</div>
          <div>• {t('readFlowPoint2')}</div>
          <div>• {t('readFlowPoint3')}</div>
          <div>• {t('readFlowPoint4')}</div>
        </div>
      </SectionCard>
    </PlatformShell>
  );
}

function buildSteps(
  overview: UserOverviewResponse | null,
  t: ReturnType<typeof useTranslations<'DemoGuidePage'>>
): Step[] {
  if (!overview) {
    return [];
  }

  const s = overview.status;
  const ENERGY_BASE_URL = process.env.NEXT_PUBLIC_ENERGY_URL || 'http://localhost:3200'

  function energyAppHref(locale: string) {
    return `${ENERGY_BASE_URL}/${locale}`;
  }

  return [
    {
      id: 'profile',
      title: t('steps.profileTitle'),
      description: t('steps.profileDescription'),
      status:
        s.biometricConfigured && s.loginCodeConfigured ? 'done' : 'pending',
      href: '/profile',
      cta: t('steps.profileCta'),
    },
    {
      id: 'kyc',
      title: t('steps.kycTitle'),
      description: t('steps.kycDescription'),
      status: s.kycReady ? 'done' : 'pending',
      href: '/platform-kyc',
      cta: t('steps.kycCta'),
    },
    {
      id: 'permissions',
      title: t('steps.permissionsTitle'),
      description: t('steps.permissionsDescription'),
      status: s.activePermissionsCount > 0 ? 'done' : 'pending',
      href: '/platform-permissions',
      cta: t('steps.permissionsCta'),
    },
    {
      id: 'service-login',
      title: t('steps.serviceLoginTitle'),
      description: t('steps.serviceLoginDescription'),
      status: overview.onboarding.readyForServiceLogin ? 'done' : 'pending',
      href: energyAppHref(''),
      cta: t('steps.serviceLoginCta'),
    },
  ];
}

function Status({status}: {status: StepStatus}) {
  const t = useTranslations('DemoGuidePage');

  if (status === 'done') {
    return (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-700">
        {t('statusCompleted')}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-amber-700">
      {t('statusPending')}
    </span>
  );
}