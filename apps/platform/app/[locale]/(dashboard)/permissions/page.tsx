'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  fetchPermissions,
  fetchServices,
  grantPermission,
  revokePermission,
} from '@/lib/api';
import { PermissionItem, ServiceItem } from '@/lib/types';

const AVAILABLE_CLAIMS = [
  'fullName',
  'email',
  'iin',
  'birthDate',
  'gender',
  'country',
  'verified',
  'age18Plus',
];

export default function PermissionsPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [requiredTokenAmount, setRequiredTokenAmount] = useState(1);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([
    'fullName',
    'verified',
    'age18Plus',
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  const activePermission = useMemo(() => {
    return permissions.find(
        (p) =>
        p.serviceId === selectedServiceId &&
        p.status === 'ACTIVE'
    ) ?? null;
  }, [permissions, selectedServiceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [servicesData, permissionsData] = await Promise.all([
        fetchServices(),
        fetchPermissions(),
      ]);

      setServices(servicesData);
      setPermissions(permissionsData);

      if (!selectedServiceId && servicesData.length > 0) {
        setSelectedServiceId(servicesData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const toggleClaim = (claim: string) => {
    setSelectedClaims((prev) =>
      prev.includes(claim)
        ? prev.filter((item) => item !== claim)
        : [...prev, claim],
    );
  };

  const handleGrant = async () => {
    if (!selectedServiceId) {
      setError('Please select a service.');
      return;
    }

    if (selectedClaims.length === 0) {
      setError('Select at least one claim.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setLastActionResult(null);

      const result = await grantPermission({
        serviceId: selectedServiceId,
        allowedClaims: selectedClaims,
      });

      setLastActionResult(
        `Granted permission ${result.permission.id} with ${result.scopeGrants.length} scope token grants.`,
      );

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Grant failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (permissionId: string) => {
    try {
      setSubmitting(true);
      setError(null);
      setLastActionResult(null);

      await revokePermission(permissionId);
      setLastActionResult(`Revoked permission ${permissionId}.`);

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoke failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="Permissions Dashboard"
      description="Create and revoke scoped KYC permissions for registered services. This screen uses the real protocol backend."
    >
      <SectionCard
        title="Grant Permission"
        description="Choose a service, select claims, and mint scope capability tokens."
        actions={
          <button
            onClick={() => void loadData()}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Refresh
          </button>
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading dashboard data...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

            <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
                Required token amount
            </label>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900">
                {activePermission
                ? activePermission.requiredTokenAmount
                : 'Auto-generated by protocol'}
            </div>
            </div>

              {selectedService ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                  <div className="font-semibold text-zinc-900">
                    {selectedService.name}
                  </div>
                  <div className="mt-1 text-zinc-600">
                    {selectedService.description || 'No description'}
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-zinc-700">
                Allowed claims
              </div>

              <div className="space-y-2">
                {AVAILABLE_CLAIMS.map((claim) => (
                  <label
                    key={claim}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-900"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClaims.includes(claim)}
                      onChange={() => toggleClaim(claim)}
                      disabled={!!activePermission}
                      className="h-4 w-4"
                    />
                    <span>{claim}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => void handleGrant()}
            disabled={submitting || loading || !!activePermission}
            className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Grant Permission'}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {lastActionResult ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {lastActionResult}
          </div>
        ) : null}

        {activePermission ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            An active permission already exists for this service.  
            Revoke it before creating a new one.
        </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Existing Permissions"
        description="These records come from the real backend and reflect protocol state."
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading permissions...</div>
        ) : permissions.length === 0 ? (
          <div className="text-sm text-zinc-500">No permissions found.</div>
        ) : (
          <div className="space-y-4">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
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
                    label="Required amount"
                    value={String(permission.requiredTokenAmount ?? 0)}
                  />
                  <MetricCard
                    label="Permission PDA"
                    value={permission.onchainPermissionPda ?? '—'}
                  />
                  <MetricCard
                    label="Scopes hash"
                    value={permission.scopesHash ?? '—'}
                  />
                  <MetricCard
                    label="Allowed claims"
                    value={(permission.allowedClaims ?? []).join(', ') || '—'}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => void handleRevoke(permission.id)}
                    disabled={submitting || permission.status === 'REVOKED'}
                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
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