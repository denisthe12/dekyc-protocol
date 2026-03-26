'use client';

import { useEffect, useMemo, useState } from 'react';
import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  fetchUserFacingPermissions,
  fetchUserFacingServiceCatalog,
  grantPermission,
  revokePermission,
} from '@/lib/api';
import {
  UserFacingPermissionItem,
  UserFacingServiceCatalogItem,
} from '@/lib/types';

import { EmptyState } from '@/components/ui/empty-state';
import { ActionBar } from '@/components/ui/action-bar';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { inputClassName } from '@/components/ui/input-class';

export default function PlatformPermissionsPage() {
  const [services, setServices] = useState<UserFacingServiceCatalogItem[]>([]);
  const [permissions, setPermissions] = useState<UserFacingPermissionItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedOptionalClaims, setSelectedOptionalClaims] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  const activePermission = useMemo(() => {
    return permissions.find(
      (permission) =>
        permission.service.id === selectedServiceId &&
        permission.status === 'ACTIVE',
    ) ?? null;
  }, [permissions, selectedServiceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [catalog, userPermissions] = await Promise.all([
        fetchUserFacingServiceCatalog(),
        fetchUserFacingPermissions(),
      ]);

      setServices(catalog);
      setPermissions(userPermissions);

      if (!selectedServiceId && catalog.length > 0) {
        setSelectedServiceId(catalog[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setSelectedOptionalClaims([]);
  }, [selectedServiceId]);

  const toggleOptionalClaim = (claim: string) => {
    setSelectedOptionalClaims((prev) =>
      prev.includes(claim)
        ? prev.filter((item) => item !== claim)
        : [...prev, claim],
    );
  };

  const handleGrant = async () => {
    if (!selectedService) {
      setError('Select a service first.');
      return;
    }

    if (activePermission) {
      setError('Revoke the active permission before creating a new one.');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);

      const requiredClaims = Array.isArray(selectedService.requiredClaims)
        ? selectedService.requiredClaims
        : [];

      const allowedClaims = [...new Set([...requiredClaims, ...selectedOptionalClaims])];

      const result = await grantPermission({
        serviceId: selectedService.id,
        allowedClaims,
      });

      setMessage(
        `Permission created for ${selectedService.name}. Granted claims: ${allowedClaims.join(', ')}`,
      );

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create permission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (permissionId: string) => {
    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);

      await revokePermission(permissionId);
      setMessage(`Permission ${permissionId} revoked.`);

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke permission');
    } finally {
      setActionLoading(false);
    }
  };

  const requiredClaims = selectedService?.requiredClaims ?? [];
  const optionalClaims = selectedService?.optionalClaims ?? [];

  return (
    <PlatformShell
      title="Permissions"
      description="Choose a service and approve exactly which KYC data it may access."
    >
      <SectionCard
        title="Create Permission"
        description="Required claims are enforced by the service. Optional claims are your choice."
        actions={
          <SecondaryButton onClick={() => void loadData()}>
            Refresh
          </SecondaryButton>
                  }
         >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading services and permissions...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className={inputClassName}
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedService ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-base font-semibold text-zinc-900">
                  {selectedService.name}
                </div>
                <div className="mt-1 text-sm text-zinc-600">
                  {selectedService.description || 'No description'}
                </div>

                {selectedService.category ? (
                  <div className="mt-3">
                    <StatusBadge label={selectedService.category} tone="neutral" />
                  </div>
                ) : null}
              </div>
            ) : null}

            {activePermission ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                You already have an active permission for this service. Revoke it first if you want to create a new one.
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-3 text-sm font-semibold text-zinc-800">
                  Required claims
                </div>

                <div className="space-y-2">
                  {requiredClaims.length === 0 ? (
                    <div className="text-sm text-zinc-500">No required claims.</div>
                  ) : (
                    requiredClaims.map((claim) => (
                      <label
                        key={claim}
                        className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-900"
                      >
                        <input type="checkbox" checked readOnly className="h-4 w-4" />
                        <span>{claim}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-semibold text-zinc-800">
                  Optional claims
                </div>

                <div className="space-y-2">
                  {optionalClaims.length === 0 ? (
                    <div className="text-sm text-zinc-500">No optional claims.</div>
                  ) : (
                    optionalClaims.map((claim) => (
                      <label
                        key={claim}
                        className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-900"
                      >
                        <input
                          type="checkbox"
                          checked={selectedOptionalClaims.includes(claim)}
                          onChange={() => toggleOptionalClaim(claim)}
                          disabled={!!activePermission}
                          className="h-4 w-4"
                        />
                        <span>{claim}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>


            <div>
            <PrimaryButton
              onClick={() => void handleGrant()}
              disabled={actionLoading || !!activePermission || !selectedService}
            >
              {actionLoading ? 'Processing...' : 'Grant Access'}
            </PrimaryButton>
            <div className="mt-3 text-xs text-zinc-500">
              Required claims are enforced by the selected service. Optional claims are shared only if you approve them.
            </div>
            </div>
          </div>
        )}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}
      </SectionCard>

      <ActionBar
        title="Permission lifecycle"
        description="Required claims are enforced by the service, optional claims are chosen by the user, and protocol thresholds are generated automatically."
      />

      <SectionCard
        title="Your Permissions"
        description="Here you can review and revoke the permissions you have granted."
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading permissions...</div>
        ) : permissions.length === 0 ? (
          <EmptyState
            title="No permissions created yet"
            description="Choose a service above and grant your first scoped permission."
          />
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
                    label="Granted claims"
                    value={(permission.allowedClaims ?? []).join(', ') || '—'}
                  />
                  <MetricCard label="Created at" value={permission.createdAt} />
                  <MetricCard
                    label="Revoked at"
                    value={permission.revokedAt ?? '—'}
                  />
                </div>

                <div className="mt-4">
                <button
                  onClick={() => void handleRevoke(permission.id)}
                  disabled={actionLoading || permission.status === 'REVOKED'}
                  className="rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Revoke Access
                </button>
                </div>
              </div>
            ))}
          </div>
        )}
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