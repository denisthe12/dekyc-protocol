'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceShell } from '@/components/service/service-shell';
import { fetchServices } from '@/lib/api';
import { ServiceItem } from '@/lib/types';
import { loadServiceSession, saveServiceSession } from '@/lib/service-session';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { inputClassName } from '@/components/ui/input-class';
import { FaceScanModal } from '@/components/biometric/face-scan-modal';

const DEFAULT_REQUESTED_CLAIMS = [
  'fullName',
  'iin',
  'birthDate',
  'email',
  'verified',
  'age18Plus',
];
const serviceInputClassName =
  'w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-800';

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
  resolvedUserId: string;
};

const SERVICE_SECRETS: Record<
  string,
  {
    clientSecret: string;
    responseSigningSecret: string;
  }
> = {
   'cmn0gksia0000bghmpybkqtjs': {
     clientSecret: 'sk_9b868b87d4035d409a46e65469a4e44992309ec54434eeeb',
     responseSigningSecret: 'resp_915a8b82ca26ba2c6f7dd9c96b0d533a4c0353db3837a88ae174781a22554f87',
   },
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
  const [responseSigningSecret, setResponseSigningSecret] = useState('');
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [faceScanCompleted, setFaceScanCompleted] = useState(false);

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

  const handleStartLogin = () => {
    if (!selectedService) {
      setError('Select a service first.');
      return;
    }

    setError(null);
    setScanModalOpen(true);
  };

  const handleFaceScanComplete = () => {
    setFaceScanCompleted(true);
    setScanModalOpen(false);
    setCodeModalOpen(true);
  };

  const handleSubmitLoginCode = async () => {
    if (!selectedService) {
      setError('Select a service first.');
      return;
    }

    const secretConfig = SERVICE_SECRETS[selectedService.id];

    if (!secretConfig) {
      setError('Service demo secrets are not configured for this service.');
      return;
    }

    if (!loginCode.trim()) {
      setError('Enter your Unique Login Code.');
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
          'x-client-id': selectedService.clientId,
          'x-client-secret': secretConfig.clientSecret,
          'x-timestamp': String(timestamp),
          'x-nonce': nonce,
        },
        body: JSON.stringify({
          biometricMockId: `mock-face-${timestamp}`,
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
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      saveServiceSession({
        serviceName: selectedService.name,
        serviceId: selectedService.id,
        clientId: selectedService.clientId,
        userId: envelope.resolvedUserId,
        claims: envelope.payload.claims,
        signature: envelope.signature,
        signedEnvelope: envelope,
        responseSigningSecret: secretConfig.responseSigningSecret,
        issuedAt,
        expiresAt,
      });

      setCodeModalOpen(false);
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
                  className={serviceInputClassName}
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </Field>

              {selectedService ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-sm font-semibold text-white">
                    {selectedService.name}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-zinc-400">
                    {selectedService.description || 'No description'}
                  </div>
                </div>
              ) : null}

              <PrimaryButton
                onClick={() => void handleStartLogin()}
                disabled={submitting || loadingServices || !selectedService}
                className="w-full bg-white text-black hover:bg-zinc-200"
              >
                Login via DeKYC
              </PrimaryButton>

              {error ? (
                <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                  {error}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-lg font-semibold">How login works</div>

          <div className="mt-6 space-y-3 text-sm text-zinc-400">
            <p>1. You start login with DeKYC face scan.</p>
            <p>2. The platform verifies your identity through a mock biometric flow.</p>
            <p>3. You enter your Unique Login Code as an additional demo factor.</p>
            <p>4. The service receives a signed identity response from DeKYC.</p>
            <p>5. A trusted service session is created.</p>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            In the real product, login would rely on biometric verification only. The Unique Login Code is used here because the biometric flow is mocked for demo purposes.
          </div>
        </div>
      </div>
      <FaceScanModal
        open={scanModalOpen}
        title="Face Scan"
        description="Please place your face inside the frame. The scan will complete automatically."
        onComplete={handleFaceScanComplete}
        onClose={() => {
          setScanModalOpen(false);
        }}
      />
      {codeModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-2xl">
            <div className="text-lg font-semibold text-zinc-900">
              Enter Unique Login Code
            </div>
            <div className="mt-3 text-sm leading-6 text-zinc-600">
              Your face scan was accepted. Enter your Unique Login Code to complete the login.
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Unique Login Code
              </label>
              <input
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                className={inputClassName}
                placeholder="DK-..."
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <SecondaryButton
                onClick={() => {
                  setCodeModalOpen(false);
                  setLoginCode('');
                }}
              >
                Cancel
              </SecondaryButton>

              <PrimaryButton
                onClick={() => void handleSubmitLoginCode()}
                disabled={submitting}
              >
                {submitting ? 'Logging in...' : 'Continue'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}
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