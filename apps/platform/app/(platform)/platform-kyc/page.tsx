'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { fetchKycSummary } from '@/lib/api';
import { KycSummaryResponse } from '@/lib/types';

export default function PlatformKycPage() {
  const [data, setData] = useState<KycSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKycSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const summary = await fetchKycSummary();
      setData(summary);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load KYC summary',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKycSummary();
  }, []);

  return (
    <PlatformShell
      title="KYC"
      description="Bind your EDS after biometric setup and review your verified KYC profile."
    >
      <SectionCard
        title="KYC Gating"
        description="Biometric mock must be configured before EDS can be connected."
        actions={
          <button
            onClick={() => void loadKycSummary()}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Refresh
          </button>
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading KYC status...</div>
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
                    ? 'Biometric configured'
                    : 'Biometric required'
                }
                tone={
                  data.gating.biometricConfigured ? 'success' : 'warning'
                }
              />
              <StatusBadge
                label={data.eds.connected ? 'EDS connected' : 'EDS not connected'}
                tone={data.eds.connected ? 'success' : 'warning'}
              />
              <StatusBadge
                label={data.kyc.ready ? 'KYC ready' : 'KYC not ready'}
                tone={data.kyc.ready ? 'success' : 'warning'}
              />
              <StatusBadge
                label={data.vault.ready ? 'Vault ready' : 'Vault not ready'}
                tone={data.vault.ready ? 'success' : 'warning'}
              />
            </div>

            {!data.gating.canBindEds ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                Configure biometric mock in your Profile page before binding EDS.
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-sm text-zinc-700">
                  Biometric step is complete. You can now connect your EDS and
                  complete KYC verification.
                </div>

                <div className="mt-4">
                  <Link
                    href="/eds-lab"
                    className="inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    Open EDS Verification
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Verified KYC Profile"
        description="This is the user-facing KYC snapshot extracted after EDS verification."
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading profile...</div>
        ) : !data?.kyc.profile ? (
          <div className="text-sm text-zinc-500">
            No KYC profile yet. Complete biometric setup and connect EDS first.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Full name" value={data.kyc.profile.fullName ?? '—'} />
            <MetricCard label="First name" value={data.kyc.profile.firstName ?? '—'} />
            <MetricCard label="Last name" value={data.kyc.profile.lastName ?? '—'} />
            <MetricCard
              label="Middle name"
              value={data.kyc.profile.middleName ?? '—'}
            />
            <MetricCard label="IIN" value={data.kyc.profile.iin ?? '—'} />
            <MetricCard label="Email" value={data.kyc.profile.email ?? '—'} />
            <MetricCard
              label="Birth date"
              value={data.kyc.profile.birthDate ?? '—'}
            />
            <MetricCard label="Gender" value={data.kyc.profile.gender ?? '—'} />
            <MetricCard label="Country" value={data.kyc.profile.country ?? '—'} />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Security Status"
        description="KYC is stored off-chain in encrypted form. On-chain only permission state is recorded."
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading security status...</div>
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="EDS bound"
              value={data.eds.connected ? 'Yes' : 'No'}
            />
            <MetricCard
              label="Vault encrypted"
              value={data.vault.ready ? 'Yes' : 'No'}
            />
            <MetricCard
              label="Vault algorithm"
              value={data.vault.entry?.algorithm ?? '—'}
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