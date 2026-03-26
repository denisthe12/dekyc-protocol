'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { fetchKycSummary } from '@/lib/api';
import { KycSummaryResponse } from '@/lib/types';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { runPlatformEdsFlow, RunPlatformEdsFlowResult } from '@/lib/eds/eds-flow';

export default function PlatformKycPage() {
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
        err instanceof Error ? err.message : 'Failed to load KYC summary',
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
      setSignatureFlowError('Digital signature is already connected.');
      return;
    }
    try {
      setConnectingSignature(true);
      setSignatureFlowError(null);
      setSignatureFlowMessage(null);

      const result = await runPlatformEdsFlow();

      setLastEdsFlowResult(result);
      setSignatureFlowMessage(
        'Digital signature connected successfully. Your KYC profile was updated.',
      );

      await loadKycSummary();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to connect digital signature';

      setSignatureFlowError(message);
    } finally {
      setConnectingSignature(false);
    }
  };

  return (
    <PlatformShell
      title="KYC"
      description="Connect your digital signature and review your verified KYC profile."
    >
      <SectionCard
        title="KYC Gating"
        description="Biometric setup must be completed before your digital signature can be connected."
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
                label={data.eds.connected ? 'Digital signature connected' : 'Digital signature not connected'}
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

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-sm text-zinc-700">
                Biometric setup is complete. You can now connect your digital signature and complete identity verification.
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <PrimaryButton
                  onClick={() => void handleConnectDigitalSignature()}
                  disabled={connectingSignature || isDigitalSignatureAlreadyConnected}
                >
                  {isDigitalSignatureAlreadyConnected
                    ? 'Digital Signature Already Connected'
                    : connectingSignature
                      ? 'Connecting Digital Signature...'
                      : 'Connect Digital Signature'}
                </PrimaryButton>

                <SecondaryButton onClick={() => void loadKycSummary()}>
                  Refresh KYC Status
                </SecondaryButton>
              </div>

              <div className="mt-3 text-xs text-zinc-500">
                After successful verification, your KYC profile will be filled automatically.
              </div>
              {isDigitalSignatureAlreadyConnected ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  Your digital signature is already connected. Rebinding is not available in the current product flow.
                </div>
              ) : null}
            </div>
            {signatureFlowError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {signatureFlowError.includes('NCALayer')
                  ? 'NCALayer is not running. Please start NCALayer first and try again.'
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
                  Latest Digital Signature Connection
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <MetricCard
                    label="Challenge ID"
                    value={lastEdsFlowResult.challenge.challengeId}
                  />
                  <MetricCard
                    label="Challenge Base64"
                    value={lastEdsFlowResult.challenge.challengeBase64}
                  />
                  <MetricCard
                    label="Analyze Result"
                    value={lastEdsFlowResult.analyzeResult ? 'Saved' : 'Processed'}
                  />
                </div>
              </div>
            ) : null}
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
        <EmptyState
          title="No KYC profile yet"
          description="Complete biometric setup and connect your EDS first. After verification, your user-facing KYC profile will appear here."
        />
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