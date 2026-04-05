import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';

export default function DashboardHomePage() {
  return (
    <DashboardShell
      title="Protocol Dashboard"
      description="Judge-facing overview of the decentralized KYC access protocol. Explore permissions, services, on-chain state, scoped tokens, and signed KYC responses."
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Identity Layer"
          description="User onboarding, EDS certificate extraction, derived KYC fields, encrypted vault storage."
        >
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="EDS" tone="success" />
            <StatusBadge label="UserCert" tone="success" />
            <StatusBadge label="KycProfile" tone="success" />
            <StatusBadge label="KycVaultEntry" tone="success" />
          </div>
        </SectionCard>

        <SectionCard
          title="Permission Layer"
          description="Scoped access grants, grant/revoke flows, service permissions, Web3 OAuth style scopes."
        >
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="Grant/Revoke" tone="success" />
            <StatusBadge label="Scoped Claims" tone="success" />
            <StatusBadge label="Signed Response" tone="success" />
          </div>
        </SectionCard>

        <SectionCard
          title="Blockchain Layer"
          description="Anchor program, UserPDA, PermissionPDA, scope tokens, mint/burn, balance checks."
        >
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="Solana" tone="success" />
            <StatusBadge label="Anchor" tone="success" />
            <StatusBadge label="Token-2022" tone="success" />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Quick Navigation"
        description="Use these views during the demo to show the protocol end-to-end."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/permissions"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            Open Permissions Dashboard
          </Link>

          <Link
            href="/services"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            Open Services Dashboard
          </Link>

          <Link
            href="/protocol"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            Open Protocol Monitor
          </Link>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}