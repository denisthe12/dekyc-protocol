'use client';

import { useRouter } from 'next/navigation';
import { ServiceShell } from '@/components/service/service-shell';
import { ServiceSessionGuard } from '@/components/service/service-session-guard';
import {
  clearServiceSession,
  ServiceSession,
} from '@/lib/service-session';

export default function ServiceDashboardPage() {
  return (
    <ServiceSessionGuard>
      {(session) => <ServiceDashboardContent session={session} />}
    </ServiceSessionGuard>
  );
}

function ServiceDashboardContent({ session }: { session: ServiceSession }) {
  const router = useRouter();

  const handleLogout = () => {
    clearServiceSession();
    router.push('/service-login');
  };

  return (
    <ServiceShell
      title={`${session.serviceName} Dashboard`}
      description="Consumer service session created through the DeKYC protocol."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-lg font-semibold">Session</div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Metric label="Service" value={session.serviceName} />
            <Metric label="User ID" value={session.userId} />
            <Metric label="Issued At" value={session.issuedAt} />
            <Metric label="Expires At" value={session.expiresAt} />
            <Metric
              label="Status"
              value={
                new Date(session.expiresAt).getTime() > Date.now()
                  ? 'Active'
                  : 'Expired'
              }
            />
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-800 bg-emerald-950/20 p-6">
            <div className="text-lg font-semibold text-emerald-300">
              Trust & Verification
            </div>

            <div className="mt-4 space-y-2 text-sm text-emerald-200">
              <div>✅ Verified via DeKYC Protocol</div>
              <div>🔐 Cryptographically signed response</div>
              <div>⛓ Backed by on-chain permission</div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-red-800 bg-red-950/30 px-5 py-3 text-sm font-semibold text-red-300 hover:bg-red-950/50"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-lg font-semibold">Granted Claims</div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Object.entries(session.claims).map(([key, value]) => (
              <ClaimCard key={key} label={formatClaimKey(key)} value={value} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="text-lg font-semibold">Signed Envelope</div>

        <pre className="mt-6 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100">
          {JSON.stringify(session.signedEnvelope, null, 2)}
        </pre>
      </div>
    </ServiceShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-2 break-all text-sm font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

function ClaimCard({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  const isBoolean = typeof value === 'boolean';

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </div>

      <div className="mt-2 text-sm font-semibold text-white">
        {isBoolean ? (value ? '✅ Verified' : '❌ Not verified') : String(value)}
      </div>
    </div>
  );
}

function formatClaimKey(key: string) {
  switch (key) {
    case 'fullName':
      return 'Full Name';
    case 'iin':
      return 'IIN';
    case 'birthDate':
      return 'Birth Date';
    case 'verified':
      return 'Identity Verified';
    case 'age18Plus':
      return 'Age 18+';
    case 'email':
      return 'Email';
    default:
      return key;
  }
}