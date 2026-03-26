'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { fetchUserOverview } from '@/lib/api';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricTile } from '@/components/ui/metric-tile';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { ActionBar } from '@/components/ui/action-bar';

import type { UserOverviewResponse } from '@/lib/types';

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
  const [overview, setOverview] = useState<UserOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    try {
      setError(null);
      const data = await fetchUserOverview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overview');
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const steps = buildSteps(overview);

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
      title="Demo Guide"
      description="Step-by-step walkthrough of the DeKYC user journey: profile setup, identity verification, permission creation, and service login."
    >
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">
          What this guide is for
        </div>

        <div className="mt-3 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
          <div>• Shows the complete user journey from onboarding to service access</div>
          <div>• Helps judges follow the product flow in the correct order</div>
          <div>• Connects user platform, KYC flow, permissions, and service login</div>
          <div>• Works as a presentation checklist during the demo</div>
        </div>
      </div>

      <SectionCard
        title="Demo Progress"
        description="This progress reflects the current state of the user platform and readiness for service access."
      >
        {!overview ? (
          error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <EmptyState
              title="Loading demo progress"
              description="The platform is collecting current onboarding and permission state."
            />
          )
        ) : (
          <div className="space-y-5">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-900">Guide completion</span>
                <span className="text-zinc-600">
                  {completedSteps}/{steps.length}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-3 text-sm text-zinc-600">
                {progressPercent}% of the guided flow is currently completed
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricTile
                label="User Email"
                value={overview.user.email}
              />
              <MetricTile
                label="Active Permissions"
                value={String(overview.status.activePermissionsCount)}
              />
              <MetricTile
                label="KYC Ready"
                value={overview.status.kycReady ? 'Yes' : 'No'}
              />
              <MetricTile
                label="Service Login Ready"
                value={overview.onboarding.readyForServiceLogin ? 'Yes' : 'No'}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <ActionBar
        title="Recommended presentation order"
        description="For the strongest demo, follow the steps below in order. This keeps both technical and non-technical judges oriented."
        actions={
          <SecondaryButton onClick={() => void loadOverview()}>
            Refresh Status
          </SecondaryButton>
        }
      />

      <div className="space-y-6">
        {steps.length === 0 ? (
          <EmptyState
            title="No demo steps available yet"
            description="The guide will appear after platform overview data is loaded."
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
                    ? 'This part of the flow is already completed and ready to demonstrate.'
                    : 'This part of the flow still needs to be completed during the demo or setup.'}
                </div>

                <Link href={step.href}>
                  {step.status === 'done' ? (
                    <PrimaryButton>
                      {step.cta}
                    </PrimaryButton>
                  ) : (
                    <SecondaryButton>
                      {step.cta}
                    </SecondaryButton>
                  )}
                </Link>
              </div>
            </SectionCard>
          ))
        )}
      </div>

      <SectionCard
        title="How judges should read this flow"
        description="This sequence shows that DeKYC is not just a technical prototype, but a complete product experience."
      >
        <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
          <div>• The user completes identity onboarding inside the platform</div>
          <div>• EDS verification produces a reusable KYC profile</div>
          <div>• Permissions are explicitly granted to a chosen service</div>
          <div>• The service receives signed, token-enforced KYC access</div>
        </div>
      </SectionCard>
    </PlatformShell>
  );
}

function buildSteps(overview: UserOverviewResponse | null): Step[] {
  if (!overview) {
    return [];
  }

  const s = overview.status;

    return [
    {
      id: 'profile',
      title: 'Setup Profile',
      description:
        'Configure Biometric Mock and generate your Unique Login Code.',
      status:
        s.biometricConfigured && s.loginCodeConfigured ? 'done' : 'pending',
      href: '/profile',
      cta: 'Open Profile',
    },
    {
      id: 'kyc',
      title: 'Complete KYC',
      description:
        'Connect your digital signature and build a verified KYC profile.',
      status: s.kycReady ? 'done' : 'pending',
      href: '/platform-kyc',
      cta: 'Open KYC',
    },
    {
      id: 'permissions',
      title: 'Grant Permission',
      description:
        'Choose a service and approve exactly which identity claims it may access.',
      status: s.activePermissionsCount > 0 ? 'done' : 'pending',
      href: '/platform-permissions',
      cta: 'Open Permissions',
    },
    {
      id: 'service-login',
      title: 'Login to Service',
      description:
        'Enter the consumer service using Biometric Mock and Unique Login Code.',
      status: overview.onboarding.readyForServiceLogin ? 'done' : 'pending',
      href: '/service-login',
      cta: 'Open Service Login',
    },
  ];
}

function Status({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-700">
        Completed
      </span>
    );
  }

  return (
    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-amber-700">
      Pending
    </span>
  );
}