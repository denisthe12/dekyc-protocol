'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { fetchServices } from '@/lib/api';
import { EmptyState } from '@/components/ui/empty-state';
import { ActionBar } from '@/components/ui/action-bar';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { inputClassName } from '@/components/ui/input-class';
import { MetricTile } from '@/components/ui/metric-tile';
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

type TokenCheck = {
  scope: string;
  ok: boolean;
  reason: string;
  readError: string | null;
  tokenAccountAddress: string | null;
  mintAddress: string | null;
  balance: number;
  requiredAmount: number;
};

type SignedKycEnvelope = {
  payload: {
    allowed: boolean;
    reason: string;
    claims: Record<string, unknown> | null;
    grantedClaims?: string[];
    grantedScopes?: string[];
    tokenChecks?: TokenCheck[];
    [key: string]: unknown;
  };
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

  const tokenChecks = response?.payload.tokenChecks ?? [];
  const grantedClaims = response?.payload.grantedClaims ?? [];
  const grantedScopes = response?.payload.grantedScopes ?? [];

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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-api/kyc-request`, {
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
      description="Guided technical walkthrough of a real service KYC request: service auth, policy enforcement, token balance checks, and signed response delivery."
    >
      <ActionBar
        title="How to use this screen"
        description="Choose a registered service, provide its credentials, enter a userId, request selected claims, and inspect the signed response returned by the protocol."
        actions={
          <SecondaryButton onClick={() => void loadServices()}>
            Refresh Services
          </SecondaryButton>
        }
      />

      <SectionCard
        title="Request Builder"
        description="This form matches the real /service-api/kyc-request contract."
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

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  x-client-id
                </label>
                <input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={inputClassName}
                  placeholder="svc_..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  x-client-secret
                </label>
                <input
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className={inputClassName}
                  placeholder="sk_..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  body.userId
                </label>
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className={inputClassName}
                  placeholder="cmm..."
                />
              </div>

              {selectedService ? (
                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-sm font-semibold text-zinc-900">
                    {selectedService.name}
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">
                    {selectedService.description || 'No description'}
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-zinc-700">
                body.requestedClaims
              </div>

              <div className="space-y-2">
                {AVAILABLE_CLAIMS.map((claim) => (
                  <label
                    key={claim}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900"
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
          <PrimaryButton
            onClick={() => void submitRequest()}
            disabled={submitting || loadingServices}
          >
            {submitting ? 'Requesting...' : 'Request Signed KYC Response'}
          </PrimaryButton>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="HTTP Request Shape"
        description="Headers come from service auth. The body contains only userId and requestedClaims."
      >
        <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100">
{`POST /api/service-api/kyc-request

Headers:
  x-client-id
  x-client-secret
  x-timestamp
  x-nonce

Body:
{
  "userId": "${userId || 'cmm...'}",
  "requestedClaims": ${JSON.stringify(requestedClaims, null, 2)}
}`}
        </pre>
      </SectionCard>

      <SectionCard
        title="Response Summary"
        description="High-level result of the protocol decision."
      >
        {!response ? (
          <EmptyState
            title="No response yet"
            description="Submit a real KYC request above to inspect policy enforcement, token checks, and signed delivery."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="Allowed"
              value={response.payload.allowed ? 'Yes' : 'No'}
            />
            <MetricTile
              label="Reason"
              value={String(response.payload.reason)}
            />
            <MetricTile
              label="Granted claims"
              value={grantedClaims.length ? grantedClaims.join(', ') : '—'}
            />
            <MetricTile
              label="Granted scopes"
              value={grantedScopes.length ? grantedScopes.join(', ') : '—'}
            />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Token Checks"
        description="This is the on-chain enforcement layer: each requested scope is checked against its token-backed capability."
      >
        {!response ? (
          <EmptyState
            title="No token checks yet"
            description="After a request, this section will show balance checks, token accounts, mint addresses, and enforcement outcomes."
          />
        ) : tokenChecks.length === 0 ? (
          <EmptyState
            title="No token checks returned"
            description="The response did not include token check data for this request."
          />
        ) : (
          <div className="space-y-4">
            {tokenChecks.map((check) => (
              <div
                key={check.scope}
                className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {check.scope}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      Reason: {check.reason}
                    </div>
                  </div>

                  <StatusBadge
                    label={check.ok ? 'BALANCE OK' : 'BALANCE FAILED'}
                    tone={check.ok ? 'success' : 'danger'}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricTile
                    label="Required amount"
                    value={String(check.requiredAmount)}
                  />
                  <MetricTile
                    label="Balance"
                    value={String(check.balance)}
                  />
                  <MetricTile
                    label="Mint"
                    value={check.mintAddress ?? '—'}
                  />
                  <MetricTile
                    label="Token account"
                    value={check.tokenAccountAddress ?? '—'}
                  />
                </div>

                {check.readError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {check.readError}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Signed Envelope"
        description="This is the exact signed response returned by the protocol."
      >
        {!response ? (
          <EmptyState
            title="No signed envelope yet"
            description="Submit a request to view the signed KYC response envelope."
          />
        ) : (
          <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100">
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
      </SectionCard>

      <SectionCard
        title="Why this matters"
        description="This screen shows the full decision path from service authentication to signed KYC delivery."
      >
        <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
          <div>• Service identity is verified through credential headers</div>
          <div>• Requested claims are checked against granted scopes</div>
          <div>• Each scope is enforced via token balance checks</div>
          <div>• The final KYC response is signed and tamper-evident</div>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}