'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { fetchUserOverview } from '@/lib/api';
import { UserOverviewResponse } from '@/lib/types';
import { MetricTile } from '@/components/ui/metric-tile';

export default function OverviewPage() {
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
      setError(err instanceof Error ? err.message : 'Failed to load overview');
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
      title="Overview"
      description="Your DeKYC onboarding progress, readiness status, and quick actions."
    >
      <SectionCard
        title="Onboarding Progress"
        description="Complete the platform setup to use KYC-backed login on consumer services."
        actions={
          <button
            onClick={() => void loadOverview()}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Refresh
          </button>
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading overview...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-5">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-zinc-900">Onboarding progress</span>
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
                    {progressPercent}% completed
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusBadge
                label={
                  data.onboarding.readyForServiceLogin
                    ? 'Ready for service login'
                    : 'Setup incomplete'
                }
                tone={
                  data.onboarding.readyForServiceLogin ? 'success' : 'warning'
                }
              />
              <StatusBadge
                label={`Active permissions: ${data.status.activePermissionsCount}`}
                tone="neutral"
              />
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-zinc-900">
                    Service Login Readiness
                </div>
                <div className="mt-2 text-sm leading-6 text-zinc-600">
                    {data.onboarding.readyForServiceLogin
                    ? 'Your platform account is ready for DeKYC-powered service login.'
                    : 'Complete biometric setup, login code issuance, and KYC verification to unlock service login.'}
                </div>

                {data.onboarding.readyForServiceLogin ? (
                    <div className="mt-4">
                    <Link
                        href="/service-login"
                        className="inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                    >
                        Continue to Service
                    </Link>
                </div>
                ) : null}
            </div>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Account Status"
        description="Main platform states that affect KYC and service access."
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading status...</div>
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatusCard
              title="Email"
              ok={data.user.emailVerified}
              okLabel="Verified"
              pendingLabel="Not verified"
            />
            <StatusCard
              title="Biometric Mock"
              ok={data.status.biometricConfigured}
              okLabel="Configured"
              pendingLabel="Not configured"
            />
            <StatusCard
              title="Login Code"
              ok={data.status.loginCodeConfigured}
              okLabel="Issued"
              pendingLabel="Not issued"
            />
            <StatusCard
              title="EDS"
              ok={data.status.edsBound}
              okLabel="Connected"
              pendingLabel="Not connected"
            />
            <StatusCard
              title="KYC"
              ok={data.status.kycReady}
              okLabel="Ready"
              pendingLabel="Not ready"
            />
            <StatusCard
              title="Vault"
              ok={data.status.vaultReady}
              okLabel="Encrypted"
              pendingLabel="Not ready"
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Quick Actions"
        description="Fastest path to complete onboarding and create permissions."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <QuickAction
            href="/profile"
            title="Open Profile"
            description="Set mock biometric and issue your unique login code."
          />
          <QuickAction
            href="/platform-kyc"
            title="Open KYC"
            description="Bind EDS and review your verified KYC profile."
          />
          <QuickAction
            href="/platform-permissions"
            title="Open Permissions"
            description="Grant scoped access to a selected consumer service."
          />
          <QuickAction
            href="/service-login"
            title="Open Consumer Service"
            description="Login to a service using DeKYC (biometric + login code)."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Latest Snapshot"
        description="Most recent user-facing KYC and protocol readiness summary."
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading snapshot...</div>
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricTile label="Email" value={data.user.email} />
            <MetricTile
                label="Latest full name"
                value={data.latestKycProfile?.fullName ?? '—'}
            />
            <MetricTile
                label="Latest IIN"
                value={data.latestKycProfile?.iin ?? '—'}
            />
            <MetricTile
                label="Vault algorithm"
                value={data.latestVaultEntry?.algorithm ?? '—'}
            />
          </div>
        ) : null}
      </SectionCard>
      <SectionCard
        title="How it works"
        description="End-to-end DeKYC flow demonstrated in this platform."
        >
        <div className="space-y-3 text-sm text-zinc-700">
            <div>1. Configure biometric + login code</div>
            <div>2. Bind EDS and generate KYC profile</div>
            <div>3. Grant permission to a service</div>
            <div>4. Login to service using DeKYC</div>
            <div>5. Service verifies signed KYC response</div>
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