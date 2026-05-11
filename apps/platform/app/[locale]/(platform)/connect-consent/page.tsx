'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import {
  approveConnectAuthorizationSession,
  fetchConnectAuthorizationSession,
  rejectConnectAuthorizationSession,
} from '@/lib/api';
import type {
  ConnectAuthorizationSessionDetail,
  DeKycConnectClaimKey,
} from '@/lib/types';

export default function ConnectConsentPage() {
  const t = useTranslations('ConnectConsentPage');

  return (
    <Suspense
      fallback={
        <PlatformShell title={t('title')} description={t('description')}>
          <SectionCard title={t('cardTitle')} description={t('cardDescription')}>
            <div className="text-sm text-zinc-500">{t('loading')}</div>
          </SectionCard>
        </PlatformShell>
      }
    >
      <ConnectConsentContent />
    </Suspense>
  );
}

function ConnectConsentContent() {
  const t = useTranslations('ConnectConsentPage');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get('session_id');

  const [session, setSession] =
    useState<ConnectAuthorizationSessionDetail | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<DeKycConnectClaimKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expiresAtLabel = useMemo(() => {
    if (!session?.expiresAt) {
      return '—';
    }

    return new Date(session.expiresAt).toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US');
  }, [locale, session?.expiresAt]);

  useEffect(() => {
    if (!sessionId) {
      setError(t('missingSessionId'));
      setLoading(false);
      return;
    }

    void loadSession(sessionId);
  }, [sessionId]);

  async function loadSession(nextSessionId: string): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchConnectAuthorizationSession(nextSessionId);

      setSession(data);
      setSelectedClaims(data.requestedClaims);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }

  function toggleClaim(claim: DeKycConnectClaimKey): void {
    setSelectedClaims((prev) =>
      prev.includes(claim)
        ? prev.filter((item) => item !== claim)
        : [...prev, claim],
    );
  }

  async function handleApprove(): Promise<void> {
    if (!session) {
      return;
    }

    if (selectedClaims.length === 0) {
      setError(t('selectAtLeastOneClaim'));
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const result = await approveConnectAuthorizationSession({
        sessionId: session.sessionId,
        approvedClaims: selectedClaims,
      });

      if (!result.redirectUriWithCode) {
        throw new Error(t('missingRedirectUriWithCode'));
      }

      window.location.href = result.redirectUriWithCode;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('approveError'));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(): Promise<void> {
    if (!session) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const result = await rejectConnectAuthorizationSession({
        sessionId: session.sessionId,
        reason: 'User rejected consent',
      });

      if (result.redirectUriWithError) {
        window.location.href = result.redirectUriWithError;
        return;
      }

      router.push(`/${locale}/platform-permissions`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('rejectError'));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <PlatformShell title={t('title')} description={t('description')}>
      <SectionCard title={t('cardTitle')} description={t('cardDescription')}>
        {loading ? (
          <div className="text-sm text-zinc-500">{t('loading')}</div>
        ) : error && !session ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : session ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                    {t('requestFrom')}
                  </div>

                  <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                    {session.service.name}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                    {session.service.description || t('noDescription')}
                  </p>
                </div>

                <StatusBadge label={session.status} tone="neutral" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <MetricCard label={t('clientId')} value={session.service.clientId} />
                <MetricCard label={t('expiresAt')} value={expiresAtLabel} />
                <MetricCard label={t('redirectUri')} value={session.redirectUri} />
                <MetricCard
                  label={t('state')}
                  value={session.state ?? t('emptyValue')}
                />
              </div>
            </div>

            {session.existingPermission?.status === 'ACTIVE' ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {t('activePermissionHint')}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                {t('noActivePermissionHint')}
              </div>
            )}

            <div>
              <div className="text-sm font-semibold text-zinc-900">
                {t('requestedClaimsTitle')}
              </div>

              <p className="mt-1 text-sm leading-6 text-zinc-600">
                {t('requestedClaimsDescription')}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {session.requestedClaims.map((claim) => (
                  <label
                    key={claim}
                    className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClaims.includes(claim)}
                      onChange={() => toggleClaim(claim)}
                      className="mt-1 h-4 w-4"
                    />

                    <span>
                      <span className="block font-semibold">
                        {t(`claims.${claim}.label`)}
                      </span>
                      <span className="mt-1 block text-zinc-500">
                        {t(`claims.${claim}.description`)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-sm font-semibold text-zinc-900">
                {t('consentTextTitle')}
              </div>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {t('consentTextDescription', {
                  serviceName: session.service.name,
                  claims: selectedClaims
                    .map((claim) => t(`claims.${claim}.label`))
                    .join(', '),
                })}
              </p>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                onClick={() => void handleApprove()}
                disabled={actionLoading || selectedClaims.length === 0}
              >
                {actionLoading ? t('processing') : t('approveAndContinue')}
              </PrimaryButton>

              <SecondaryButton
                onClick={() => void handleReject()}
                disabled={actionLoading}
              >
                {t('reject')}
              </SecondaryButton>
            </div>
          </div>
        ) : null}
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