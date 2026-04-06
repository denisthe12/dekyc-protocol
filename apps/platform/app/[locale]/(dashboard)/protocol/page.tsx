'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { fetchProtocolSnapshot } from '@/lib/api';
import { ProtocolSnapshot } from '@/lib/types';
import { EmptyState } from '@/components/ui/empty-state';
import { SecondaryButton } from '@/components/ui/buttons';

const LOCAL_EXPLORER_BASE =
  'https://explorer.solana.com/address';

const LOCAL_EXPLORER_SUFFIX =
  '?cluster=devnet';

function buildExplorerUrl(address: string) {
  return `${LOCAL_EXPLORER_BASE}/${address}${LOCAL_EXPLORER_SUFFIX}`;
}

export default function ProtocolPage() {
  const [snapshot, setSnapshot] = useState<ProtocolSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshot = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchProtocolSnapshot();
      setSnapshot(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load protocol snapshot',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSnapshot();
  }, []);

  return (
    <DashboardShell
      title="Protocol Monitor"
      description="Live judge-facing monitor for on-chain permission state, scope capability tokens, and recent protocol activity."
    >
      <div className="mb-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-zinc-900">
        What this proves
      </div>

      <div className="mt-3 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
        <div>• Permissions are registered on-chain (Program PDA)</div>
        <div>• Each scope is backed by Token-2022 capability tokens</div>
        <div>• Access is enforced via token balance checks</div>
        <div>• KYC responses are signed and independently verifiable</div>
      </div>
    </div>
      <SectionCard
        title="Live Snapshot"
        description="Current protocol state loaded from the real backend."
        actions={
          <SecondaryButton onClick={() => void loadSnapshot()}>
            Refresh
          </SecondaryButton>
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading protocol state...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : snapshot ? (
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Permissions"
              value={String(snapshot.permissions.length)}
            />
            <MetricCard
              label="Recent Access Logs"
              value={String(snapshot.accessLogs.length)}
            />
            <MetricCard
              label="Active Scope Grants"
              value={String(
                snapshot.permissions.reduce(
                  (sum, permission) => sum + permission.scopeGrants.length,
                  0,
                ),
              )}
            />
          </div>
        ) : null}
        <div className="mt-5 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
        <div className="text-sm font-semibold text-zinc-900">
          Protocol Health
        </div>
        <div className="mt-2 text-sm leading-6 text-zinc-600">
          This console shows the live state of permissions, scope grants, on-chain
          references, and recent service access activity.
        </div>
      </div>
      </SectionCard>

      <SectionCard
        title="Permissions + On-Chain Refs"
        description="Each permission shows backend state, PermissionPDA, and its scope token refs."
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading permissions...</div>
        ) : !snapshot || snapshot.permissions.length === 0 ? (
          <EmptyState
            title="No protocol permissions found"
            description="Create a permission from the user platform to see live protocol state, on-chain references, and scope grants here."
          />
        ) : (
          <div className="space-y-5">
            {snapshot.permissions.map((permission) => (
              <div
                key={permission.id}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-base font-semibold text-zinc-900">
                      {permission.service.name}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      Permission ID: {permission.id}
                    </div>
                  </div>

                  <StatusBadge
                    label={permission.status}
                    tone={
                      permission.status === 'ACTIVE'
                        ? 'success'
                        : permission.status === 'REVOKED'
                          ? 'danger'
                          : 'neutral'
                    }
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    label="Permission PDA"
                    value={permission.onchainPermissionPda ?? '—'}
                  />
                  <MetricCard
                    label="Scopes Hash"
                    value={permission.scopesHash ?? '—'}
                  />
                  <MetricCard
                    label="Required Amount"
                    value={String(permission.requiredTokenAmount ?? 0)}
                  />
                  <MetricCard
                    label="Allowed Claims"
                    value={(permission.allowedClaims ?? []).join(', ') || '—'}
                  />
                </div>

                {permission.onchainPermissionPda ? (
                  <div className="mt-4">
                    <a
                      href={buildExplorerUrl(permission.onchainPermissionPda)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Open PermissionPDA in Explorer
                    </a>
                  </div>
                ) : null}

                <div className="mt-5">
                  <div className="mb-3 text-sm font-semibold text-zinc-800">
                    Scope Grants
                  </div>

                  {permission.scopeGrants.length === 0 ? (
                    <div className="text-sm text-zinc-500">
                      No active scope grants.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {permission.scopeGrants.map((scopeGrant) => (
                        <div
                          key={scopeGrant.id}
                          className="rounded-xl border border-zinc-200 bg-white p-4"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="text-sm font-semibold text-zinc-900">
                                {scopeGrant.scope}
                              </div>
                              <div className="mt-1 text-xs text-zinc-500">
                                Required amount: {scopeGrant.requiredAmount}
                              </div>
                            </div>

                            <StatusBadge label="TOKENIZED" tone="success" />
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <MetricCard
                              label="Mint Address"
                              value={scopeGrant.mintAddress ?? '—'}
                            />
                            <MetricCard
                              label="Token Account"
                              value={scopeGrant.tokenAccountAddress ?? '—'}
                            />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-4 text-sm">
                            {scopeGrant.mintAddress ? (
                              <a
                                href={buildExplorerUrl(scopeGrant.mintAddress)}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                Open Mint
                              </a>
                            ) : null}

                            {scopeGrant.tokenAccountAddress ? (
                              <a
                                href={buildExplorerUrl(scopeGrant.tokenAccountAddress)}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                Open Token Account
                              </a>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))}
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              Each scope is materialized as a Token-2022 mint. Access is granted only if
              the service verifies that the user&apos;s token account balance meets the required threshold.
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Recent Access Logs"
        description="Most recent allow/deny decisions recorded by the protocol."
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading access logs...</div>
        ) : !snapshot || snapshot.accessLogs.length === 0 ? (
          <EmptyState
            title="No access logs found"
            description="Recent service decisions will appear here after KYC requests are processed."
          />
        ) : (
          <div className="space-y-3">
            {snapshot.accessLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {log.service.name}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {log.createdAt}
                    </div>
                  </div>

                  <StatusBadge
                    label={log.decision.toUpperCase()}
                    tone={log.decision === 'allowed' ? 'success' : 'danger'}
                  />
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <MetricCard label="Reason" value={log.reason ?? '—'} />
                  <MetricCard label="Permission ID" value={log.permission.id} />
                  <MetricCard
                    label="Permission PDA"
                    value={log.permission.onchainPermissionPda ?? '—'}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
        <div className="text-sm font-semibold text-zinc-900">
          Why this architecture matters
        </div>

        <div className="mt-3 text-sm leading-6 text-zinc-600">
          Instead of trusting a centralized KYC provider, services verify access
          rights via on-chain permission records, scoped capability tokens, and
          signed responses. This makes identity access portable, auditable, and
          cryptographically verifiable.
        </div>
      </div>
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