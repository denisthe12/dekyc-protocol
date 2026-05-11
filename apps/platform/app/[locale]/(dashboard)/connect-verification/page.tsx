'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SecondaryButton } from '@/components/ui/buttons';
import {
  fetchConnectVerificationSnapshot,
  verifyConnectAssertion,
} from '@/lib/api';
import type {
  ConnectVerificationSnapshot,
  VerifyAssertionResponse,
} from '@/lib/types';

export default function ConnectVerificationPage() {
  const [snapshot, setSnapshot] =
    useState<ConnectVerificationSnapshot | null>(null);
  const [verifyResult, setVerifyResult] =
    useState<VerifyAssertionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestAssertion = useMemo(() => {
    return snapshot?.identityAssertions[0] ?? null;
  }, [snapshot]);

  useEffect(() => {
    void loadSnapshot();
  }, []);

  async function loadSnapshot(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchConnectVerificationSnapshot();
      setSnapshot(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load DeKYC Connect verification snapshot',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyLatestAssertion(): Promise<void> {
    if (!latestAssertion) {
      return;
    }

    try {
      setVerifying(true);
      setError(null);

      const result = await verifyConnectAssertion(latestAssertion.assertionJws);

      setVerifyResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to verify identity assertion',
      );
    } finally {
      setVerifying(false);
    }
  }

  return (
    <DashboardShell
      title="DeKYC Connect Verification"
      description="Judge-facing verification console for authorization sessions, consent receipts, signed identity assertions, and service-specific subject IDs."
    >
      <div className="mb-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">
          What this proves
        </div>

        <div className="mt-3 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
          <div>• ENERGY logs in through DeKYC Connect authorization code</div>
          <div>• Consent is recorded as a signed receipt hash</div>
          <div>• Identity handoff is represented by signed assertion</div>
          <div>• External service receives service-specific subject ID</div>
        </div>
      </div>

      <SectionCard
        title="Issuer Metadata"
        description="Public identity provider metadata used by relying services."
        actions={
          <SecondaryButton onClick={() => void loadSnapshot()}>
            Refresh
          </SecondaryButton>
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-500">
            Loading DeKYC Connect snapshot...
          </div>
        ) : error && !snapshot ? (
          <ErrorBox message={error} />
        ) : snapshot ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Issuer" value={snapshot.issuer.issuerUrl} />
              <MetricCard label="Algorithm" value={snapshot.issuer.algorithm} />
              <MetricCard label="Metadata URL" value={snapshot.issuer.metadataUrl} />
              <MetricCard label="JWKS URL" value={snapshot.issuer.jwksUrl} />
            </div>

            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              MVP uses HS256 with server-side verification endpoint. Production
              should rotate to asymmetric RS256/EdDSA with public JWKS.
            </div>
          </>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Live Connect Totals"
        description="Counts are loaded from real DeKYC Connect database tables."
      >
        {snapshot ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            <MetricCard
              label="Auth Sessions"
              value={String(snapshot.totals.authorizationSessions)}
            />
            <MetricCard
              label="Approved"
              value={String(snapshot.totals.approvedSessions)}
            />
            <MetricCard
              label="Consent Receipts"
              value={String(snapshot.totals.consentReceipts)}
            />
            <MetricCard
              label="Active Consents"
              value={String(snapshot.totals.activeConsents)}
            />
            <MetricCard
              label="Assertions"
              value={String(snapshot.totals.identityAssertions)}
            />
          </div>
        ) : loading ? (
          <div className="text-sm text-zinc-500">Loading totals...</div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Latest Identity Assertion"
        description="Verify the newest signed assertion against DeKYC backend verification logic."
        actions={
          <SecondaryButton
            onClick={() => void handleVerifyLatestAssertion()}
            disabled={!latestAssertion || verifying}
          >
            {verifying ? 'Verifying...' : 'Verify latest assertion'}
          </SecondaryButton>
        }
      >
        {error ? <ErrorBox message={error} /> : null}

        {!snapshot || snapshot.identityAssertions.length === 0 ? (
          <EmptyState
            title="No identity assertions yet"
            description="Complete Energy login through DeKYC Connect to generate signed assertions."
          />
        ) : latestAssertion ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Assertion ID" value={latestAssertion.assertionId} />
              <MetricCard label="Consent ID" value={latestAssertion.consentId} />
              <MetricCard
                label="Service Subject ID"
                value={latestAssertion.serviceSubjectId}
              />
              <MetricCard label="Expires At" value={latestAssertion.expiresAt} />
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                JWS Preview
              </div>
              <div className="mt-2 break-all font-mono text-xs text-zinc-900">
                {latestAssertion.assertionPreview}
              </div>
            </div>

            {verifyResult ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-zinc-900">
                    Verification Result
                  </div>
                  <StatusBadge
                    label={verifyResult.valid ? 'VALID' : 'INVALID'}
                    tone={verifyResult.valid ? 'success' : 'danger'}
                  />
                </div>

                <pre className="max-h-[420px] overflow-auto rounded-xl bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">
                  {JSON.stringify(verifyResult, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Authorization Sessions"
        description="Recent hosted consent sessions created by /connect/authorize."
      >
        {snapshot?.authorizationSessions.length ? (
          <div className="space-y-3">
            {snapshot.authorizationSessions.map((session) => (
              <div
                key={session.sessionId}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-mono text-sm font-semibold text-zinc-900">
                      {session.sessionId}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {session.createdAt}
                    </div>
                  </div>

                  <StatusBadge
                    label={session.status.toUpperCase()}
                    tone={
                      session.status === 'approved'
                        ? 'success'
                        : session.status === 'rejected'
                          ? 'danger'
                          : 'neutral'
                    }
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Client ID" value={session.clientId} />
                  <MetricCard label="Consent ID" value={session.consentId ?? '—'} />
                  <MetricCard
                    label="Claims"
                    value={session.claimsScope.join(', ') || '—'}
                  />
                  <MetricCard label="Redirect URI" value={session.redirectUri} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No authorization sessions found"
            description="Start DeKYC Connect login from ENERGY to create sessions."
          />
        )}
      </SectionCard>

      <SectionCard
        title="Consent Receipts"
        description="Signed consent artifacts generated after user approval."
      >
        {snapshot?.consentReceipts.length ? (
          <div className="space-y-3">
            {snapshot.consentReceipts.map((receipt) => (
              <div
                key={receipt.consentId}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-mono text-sm font-semibold text-zinc-900">
                      {receipt.consentId}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      granted: {receipt.grantedAt}
                    </div>
                  </div>

                  <StatusBadge
                    label={receipt.status.toUpperCase()}
                    tone={receipt.status === 'active' ? 'success' : 'danger'}
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    label="Service Subject ID"
                    value={receipt.serviceSubjectId}
                  />
                  <MetricCard
                    label="Granted Claims"
                    value={receipt.grantedClaims.join(', ') || '—'}
                  />
                  <MetricCard label="Receipt Hash" value={receipt.receiptHash} />
                  <MetricCard
                    label="Signature Preview"
                    value={receipt.signaturePreview}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No consent receipts found"
            description="Approve hosted consent to generate a signed receipt."
          />
        )}
      </SectionCard>
    </DashboardShell>
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

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {message}
    </div>
  );
}