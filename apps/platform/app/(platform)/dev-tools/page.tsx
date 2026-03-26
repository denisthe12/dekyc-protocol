'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { ActionBar } from '@/components/ui/action-bar';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { EmptyState } from '@/components/ui/empty-state';
import { clearPlatformSession, hasPlatformSession } from '@/lib/platform-session';
import { clearServiceSession, loadServiceSession } from '@/lib/service-session';

export default function DevToolsPage() {
  const [platformSession, setPlatformSession] = useState(false);
  const [serviceSession, setServiceSession] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshState = () => {
    setPlatformSession(hasPlatformSession());
    setServiceSession(Boolean(loadServiceSession()));
  };

  useEffect(() => {
    refreshState();
  }, []);

  const handleClearPlatformSession = () => {
    clearPlatformSession();
    setMessage('Platform session cleared from localStorage.');
    refreshState();
  };

  const handleClearServiceSession = () => {
    clearServiceSession();
    setMessage('Consumer service session cleared from localStorage.');
    refreshState();
  };

  const handleClearAll = () => {
    clearPlatformSession();
    clearServiceSession();
    setMessage('All local demo sessions were cleared.');
    refreshState();
  };

  return (
    <PlatformShell
      title="Dev Tools"
      description="Safe local utilities for demo recovery, browser session cleanup, and validator reset awareness."
    >
      <ActionBar
        title="What this page is for"
        description="Use this screen before or between demos to quickly reset browser-side state and avoid stale sessions."
        actions={
          <SecondaryButton onClick={refreshState}>
            Refresh State
          </SecondaryButton>
        }
      />

      <SectionCard
        title="Current Local State"
        description="This reflects browser-side state used by the platform and consumer service demos."
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge
            label={platformSession ? 'Platform session present' : 'No platform session'}
            tone={platformSession ? 'success' : 'warning'}
          />
          <StatusBadge
            label={serviceSession ? 'Service session present' : 'No service session'}
            tone={serviceSession ? 'success' : 'warning'}
          />
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Reset Browser Demo State"
        description="These actions clear only local browser state. They do not touch database records."
      >
        <div className="flex flex-wrap gap-3">
          <SecondaryButton onClick={handleClearPlatformSession}>
            Clear Platform Session
          </SecondaryButton>

          <SecondaryButton onClick={handleClearServiceSession}>
            Clear Service Session
          </SecondaryButton>

          <PrimaryButton onClick={handleClearAll}>
            Clear All Local Sessions
          </PrimaryButton>
        </div>
      </SectionCard>

      <SectionCard
        title="Local Validator Reset Checklist"
        description="Important reminder for local Solana demo environments."
      >
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <div className="text-sm font-semibold text-amber-900">
            Validator reset warning
          </div>

          <div className="mt-3 space-y-2 text-sm leading-6 text-amber-800">
            <div>• If you restart the local validator, on-chain accounts disappear.</div>
            <div>• Your database records may still contain old PDA, mint, and token account references.</div>
            <div>• In that case, create fresh permissions again before running service requests.</div>
            <div>• Protocol Monitor and Explorer links should be checked after validator restarts.</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Recommended Recovery Path"
        description="Use this sequence when demo state becomes inconsistent."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <RecoveryStep
            title="1. Clear sessions"
            description="Clear platform and service localStorage sessions from this page."
          />
          <RecoveryStep
            title="2. Re-login to platform"
            description="Authenticate again and confirm overview/profile states."
          />
          <RecoveryStep
            title="3. Recreate permissions"
            description="If validator was restarted, recreate fresh permissions and scope tokens."
          />
          <RecoveryStep
            title="4. Re-run service login"
            description="Login to the consumer service again and verify signed response flow."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Quick Links"
        description="Fast navigation to the most important recovery and demo screens."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickLink
            href="/overview"
            title="Overview"
            description="Check onboarding and readiness."
          />
          <QuickLink
            href="/platform-permissions"
            title="Permissions"
            description="Recreate active permissions if needed."
          />
          <QuickLink
            href="/protocol"
            title="Protocol Monitor"
            description="Inspect live on-chain and scope state."
          />
          <QuickLink
            href="/service-login"
            title="Consumer Service"
            description="Retry login and signed session flow."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Why this page matters"
        description="This utility improves demo stability without exposing destructive admin actions."
      >
        <EmptyState
          title="Safe by design"
          description="This page only clears browser-side state and provides recovery guidance. It does not delete database records, on-chain state, or KYC data."
        />
      </SectionCard>
    </PlatformShell>
  );
}

function RecoveryStep({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-600">{description}</div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-zinc-100"
    >
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-600">{description}</div>
    </Link>
  );
}