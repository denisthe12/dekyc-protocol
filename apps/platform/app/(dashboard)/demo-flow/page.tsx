'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { fetchServices } from '@/lib/api';
import { ServiceItem } from '@/lib/types';

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

type SignedKycEnvelope = {
  payload: unknown;
  meta: {
    timestamp: number;
    nonce: string;
  };
  signature: string | null;
};

export default function DemoFlowPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [userId, setUserId] = useState('');
  const [requestedClaims, setRequestedClaims] = useState<string[]>([
    'fullName',
    'verified',
    'age18Plus',
  ]);
  const [response, setResponse] = useState<SignedKycEnvelope | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      setError(null);

      const data = await fetchServices();
      setServices(data);

      if (!selectedServiceId && data.length > 0) {
        setSelectedServiceId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      setClientId(selectedService.clientId);
    }
  }, [selectedService]);

  const toggleClaim = (claim: string) => {
    setRequestedClaims((prev) =>
      prev.includes(claim)
        ? prev.filter((item) => item !== claim)
        : [...prev, claim],
    );
  };

  const submitRequest = async () => {
    if (!clientId || !clientSecret || !userId) {
      setError('Fill clientId, clientSecret, and userId.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setResponse(null);

      const timestamp = Date.now();
      const nonce = `demo-${timestamp}`;

      const res = await fetch('http://localhost:3001/api/service-api/kyc-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId,
          'x-client-secret': clientSecret,
          'x-timestamp': String(timestamp),
          'x-nonce': nonce,
        },
        body: JSON.stringify({
          userId: userId.trim(),
          requestedClaims,
        }),
      });

      const rawText = await res.text();

      if (!res.ok) {
        throw new Error(`${res.status}: ${rawText}`);
      }

      const data = JSON.parse(rawText) as SignedKycEnvelope;
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="Demo Flow"
      description="End-to-end live demo screen for judge walkthrough: service request → policy enforcement → scope token checks → signed KYC response."
    >
      <SectionCard
        title="Request Builder"
        description="Use real service credentials and request selected KYC claims."
        actions={
          <button
            onClick={() => void loadServices()}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Refresh Services
          </button>
        }
      >
        {loadingServices ? (
          <div className="text-sm text-zinc-500">Loading services...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Registered service
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
                  Client ID
                </label>
                <input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                  placeholder="svc_..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Client Secret
                </label>
                <input
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                  placeholder="sk_..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  User ID
                </label>
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                  placeholder="cmm..."
                />
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
                Requested claims
              </div>

              <div className="space-y-2">
                {AVAILABLE_CLAIMS.map((claim) => (
                  <label
                    key={claim}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-900"
                  >
                    <input
                      type="checkbox"
                      checked={requestedClaims.includes(claim)}
                      onChange={() => toggleClaim(claim)}
                      className="h-4 w-4"
                    />
                    <span>{claim}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => void submitRequest()}
            disabled={submitting || loadingServices}
            className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? 'Requesting...' : 'Request Signed KYC Response'}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Signed Response Envelope"
        description="This is the exact tamper-evident response returned by the protocol."
      >
        {!response ? (
          <div className="text-sm text-zinc-500">
            No response yet. Submit a service request.
          </div>
        ) : (
          <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100">
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
      </SectionCard>

      <SectionCard
        title="Envelope Status"
        description="Quick visual read of the signed service response."
      >
        {!response ? (
          <div className="text-sm text-zinc-500">
            No envelope to inspect yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <StatusBadge
              label={
                response.signature ? 'SIGNED RESPONSE' : 'UNSIGNED RESPONSE'
              }
              tone={response.signature ? 'success' : 'warning'}
            />
            <StatusBadge
              label={`NONCE: ${response.meta.nonce}`}
              tone="neutral"
            />
            <StatusBadge
              label={`TIMESTAMP: ${response.meta.timestamp}`}
              tone="neutral"
            />
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
}