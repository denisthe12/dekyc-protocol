'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { fetchServices } from '@/lib/api';
import { ServiceItem } from '@/lib/types';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchServices();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  return (
    <DashboardShell
      title="Services Dashboard"
      description="View registered consumer services and their protocol integration status."
    >
      <SectionCard
        title="Registered Services"
        description="These are the services currently registered in the protocol."
        actions={
          <button
            onClick={() => void loadServices()}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Refresh
          </button>
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-500">Loading services...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : services.length === 0 ? (
          <div className="text-sm text-zinc-500">No services found.</div>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-base font-semibold text-zinc-900">
                      {service.name}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      {service.description || 'No description'}
                    </div>
                  </div>

                  <StatusBadge
                    label={service.status.toUpperCase()}
                    tone={service.status === 'active' ? 'success' : 'neutral'}
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Service ID" value={service.id} />
                  <MetricCard label="Client ID" value={service.clientId} />
                  <MetricCard label="Created At" value={service.createdAt} />
                  <MetricCard label="Updated At" value={service.updatedAt} />
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