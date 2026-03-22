'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceShell } from '@/components/service/service-shell';
import { fetchServices } from '@/lib/api';
import { ServiceItem } from '@/lib/types';
import { loadServiceSession, saveServiceSession } from '@/lib/service-session';

const DEFAULT_REQUESTED_CLAIMS = ['fullName', 'verified', 'age18Plus'];

type SignedEnvelope = {
  payload: {
    allowed: boolean;
    reason: string;
    claims: Record<string, unknown> | null;
    [key: string]: unknown;
  };
  meta: {
    timestamp: number;
    nonce: string;
  };
  signature: string | null;
};

export default function ServiceLoginPage() {
  const router = useRouter();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [userId, setUserId] = useState('');
  const [biometricMockId, setBiometricMockId] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  useEffect(() => {
    const existing = loadServiceSession();

    if (existing) {
      router.replace('/service-dashboard');
    }
  }, [router]);

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      setError(null);

      const data = await fetchServices();
      setServices(data);

      if (!selectedServiceId && data.length > 0) {
        setSelectedServiceId(data[0].id);
        setClientId(data[0].clientId);
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

  const handleLogin = async () => {
    if (!selectedService || !clientId || !clientSecret || !userId || !biometricMockId || !loginCode) {
      setError('Fill all fields before login.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const timestamp = Date.now();
      const nonce = `service-login-${timestamp}`;

      const response = await fetch('http://localhost:3001/api/service-auth/login', {
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
          biometricMockId: biometricMockId.trim(),
          loginCode: loginCode.trim(),
          requestedClaims: DEFAULT_REQUESTED_CLAIMS,
        }),
      });

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(`${response.status}: ${rawText}`);
      }

      const envelope = JSON.parse(rawText) as SignedEnvelope;

      if (!envelope.payload.allowed || !envelope.payload.claims) {
        throw new Error(`Login denied: ${envelope.payload.reason}`);
      }

      const issuedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      saveServiceSession({
        serviceName: selectedService.name,
        serviceId: selectedService.id,
        clientId,
        userId: userId.trim(),
        claims: envelope.payload.claims,
        signature: envelope.signature,
        signedEnvelope: envelope,
        issuedAt,
        expiresAt,
      });

      router.push('/service-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Service login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ServiceShell
      title="Login with DeKYC"
      description="Authenticate to the consumer service using mock face verification, unique login code, and protocol-backed KYC access."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-lg font-semibold">Service Login</div>

          {loadingServices ? (
            <div className="mt-4 text-sm text-zinc-400">Loading services...</div>
          ) : (
            <div className="mt-6 space-y-4">
              <Field label="Service">
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Client ID">
                <input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  placeholder="svc_..."
                />
              </Field>

              <Field label="Client Secret">
                <input
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  placeholder="sk_..."
                />
              </Field>

              <Field label="User ID">
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  placeholder="cmm..."
                />
              </Field>

              <Field label="Mock Face ID">
                <input
                  value={biometricMockId}
                  onChange={(e) => setBiometricMockId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  placeholder="face-denis-001"
                />
              </Field>

              <Field label="Unique Login Code">
                <input
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  placeholder="DK-..."
                />
              </Field>

              <button
                onClick={() => void handleLogin()}
                disabled={submitting}
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {submitting ? 'Logging in...' : 'Login via DeKYC'}
              </button>

              {error ? (
                <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                  {error}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-lg font-semibold">How this works</div>

          <div className="mt-6 space-y-3 text-sm text-zinc-400">
            <p>1. The service validates its credentials with the DeKYC platform.</p>
            <p>2. The user is matched by mock biometric identity and unique login code.</p>
            <p>3. The protocol checks active permission, scopes, and token balances.</p>
            <p>4. The service receives a signed KYC response envelope.</p>
            <p>5. A service-side session is created for 7 days.</p>
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-zinc-300">{label}</div>
      {children}
    </label>
  );
}