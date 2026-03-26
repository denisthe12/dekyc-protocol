'use client';

import { useEffect, useState } from 'react';
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
import { inputClassName } from '@/components/ui/input-class';
import { FaceScanModal } from '@/components/biometric/face-scan-modal';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';

export default function ProfilePage() {
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
        err instanceof Error ? err.message : 'Failed to load profile summary',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleSetupBiometric = async () => {
    try {
      setBiometricModalOpen(true);
      setBiometricScanning(true);
      setError(null);
      setActionMessage(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to start biometric flow',
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

      setActionMessage('Biometric mock configured successfully.');
      await loadProfile();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to configure biometric mock',
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
      setActionMessage('Login code issued successfully.');
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue login code');
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
      setActionMessage('Login code rotated successfully.');
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rotate login code');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLoginCode = async () => {
    if (!lastIssuedLoginCode) return;

    await navigator.clipboard.writeText(lastIssuedLoginCode);
    setActionMessage('Login code copied to clipboard.');
  };

  return (
    <PlatformShell
      title="Profile"
      description="Your platform account, onboarding status, and KYC readiness."
    >
      <SectionCard
        title="Account Summary"
        description="This section shows your account identity and onboarding state."
        actions={
          <button
            onClick={() => void loadProfile()}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Refresh
          </button>
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading profile...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="User ID" value={data.user.id} />
            <MetricCard label="Email" value={data.user.email} />
            <MetricCard
              label="Email verified"
              value={String(data.user.emailVerified)}
            />
            <MetricCard label="Created at" value={data.user.createdAt} />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Onboarding Status"
        description="You must configure biometric mock before connecting EDS."
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading statuses...</div>
        ) : data ? (
          <div className="flex flex-wrap gap-3">
            <StatusBadge
              label={
                data.profileStatus.biometricConfigured
                  ? 'Biometric configured'
                  : 'Biometric not configured'
              }
              tone={
                data.profileStatus.biometricConfigured ? 'success' : 'warning'
              }
            />
            <StatusBadge
              label={
                data.profileStatus.loginCodeConfigured
                  ? 'Login code issued'
                  : 'Login code not issued'
              }
              tone={
                data.profileStatus.loginCodeConfigured ? 'success' : 'warning'
              }
            />
            <StatusBadge
              label={data.profileStatus.edsBound ? 'Digital signature connected' : 'Digital signature not connected'}
              tone={data.profileStatus.edsBound ? 'success' : 'warning'}
            />
            <StatusBadge
              label={data.profileStatus.kycReady ? 'KYC ready' : 'KYC not ready'}
              tone={data.profileStatus.kycReady ? 'success' : 'warning'}
            />
            <StatusBadge
              label={data.profileStatus.vaultReady ? 'Vault ready' : 'Vault not ready'}
              tone={data.profileStatus.vaultReady ? 'success' : 'warning'}
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Biometric Mock Setup"
        description="Configure mock face identity before connecting EDS and using service login."
      >
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="text-sm leading-6 text-zinc-600">
            Add your biometric mock profile to enable digital signature verification and service login.
          </div>

          <div className="mt-4">
            <PrimaryButton
              onClick={() => void handleSetupBiometric()}
              disabled={actionLoading || biometricScanning}
            >
              {biometricScanning ? 'Scanning face...' : 'Add Biometric'}
            </PrimaryButton>
          </div>
        </div>

        {data?.profileStatus.biometricMockId ? (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            Current biometric mock id: <span className="font-semibold">{data.profileStatus.biometricMockId}</span>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Unique Login Code"
        description="This code is used together with mock face login on the consumer service."
      >
        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            onClick={() => void handleIssueLoginCode()}
            disabled={actionLoading || !data?.profileStatus.biometricConfigured}
            //className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            Issue Login Code
          </PrimaryButton>

          <SecondaryButton
            onClick={() => void handleRotateLoginCode()}
            disabled={actionLoading || !data?.profileStatus.biometricConfigured}
            //className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50"
          >
            Rotate Login Code
          </SecondaryButton>

          <SecondaryButton
            onClick={() => void handleCopyLoginCode()}
            disabled={!lastIssuedLoginCode}
            //className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50"
          >
            Copy Last Issued Code
          </SecondaryButton>
        </div>

        {!data?.profileStatus.biometricConfigured ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Configure biometric mock first to enable login code issuance.
          </div>
        ) : null}

        {lastIssuedLoginCode ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Last issued login code
            </div>
            <div className="mt-2 break-all text-lg font-semibold text-emerald-900">
              {lastIssuedLoginCode}
            </div>
          </div>
        ) : null}

        {data?.profileStatus.loginCodeIssuedAt ? (
          <div className="mt-4 text-sm text-zinc-600">
            Login code issued at: {data.profileStatus.loginCodeIssuedAt}
          </div>
        ) : null}
      </SectionCard>

      {actionMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {actionMessage}
        </div>
      ) : null}

      <SectionCard
        title="Latest KYC Snapshot"
        description="Your latest KYC profile extracted from EDS and protocol derivation."
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading KYC profile...</div>
        ) : !data?.latestKycProfile ? (
          <div className="text-sm text-zinc-500">
            No KYC profile yet. Configure biometric mock, then connect EDS.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Full name"
              value={data.latestKycProfile.fullName ?? '—'}
            />
            <MetricCard label="IIN" value={data.latestKycProfile.iin ?? '—'} />
            <MetricCard
              label="Birth date"
              value={data.latestKycProfile.birthDate ?? '—'}
            />
            <MetricCard
              label="Gender"
              value={data.latestKycProfile.gender ?? '—'}
            />
            <MetricCard
              label="Country"
              value={data.latestKycProfile.country ?? '—'}
            />
            <MetricCard
              label="Email"
              value={data.latestKycProfile.email ?? '—'}
            />
          </div>
        )}
      </SectionCard>
      <FaceScanModal
        open={biometricModalOpen}
        title="Biometric Scan"
        description="Please place your face inside the frame. The scan will complete automatically."
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