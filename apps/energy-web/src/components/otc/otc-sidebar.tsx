import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function OtcSidebar() {
  const t = useTranslations('OtcPage');
  const locale = useLocale();

  return (
    <aside className="sticky top-24 space-y-4">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
        <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          {t('whyOtc')}
        </div>
        <h2 className="mt-3 text-lg font-semibold text-[var(--foreground)]">
          {t('secondaryLiquidity')}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          {t('sidebarDescription')}
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
        <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          {t('quickAccess')}
        </div>

        <div className="mt-4 space-y-3">
          <Link
            href={`/${locale}/assets`}
            className="block rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-medium transition hover:bg-[var(--muted)]/40"
          >
            {t('goToAssets')}
          </Link>

          <Link
            href={`/${locale}/portfolio`}
            className="block rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-medium transition hover:bg-[var(--muted)]/40"
          >
            {t('goToPortfolio')}
          </Link>

          <Link
            href={`/${locale}/judge`}
            className="block rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
          >
            {t('goToJudge')}
          </Link>
        </div>
      </div>
    </aside>
  );
}