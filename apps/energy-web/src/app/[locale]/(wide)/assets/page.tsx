import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { fetchPublicAssets } from '@/lib/api/public-assets';
import { AssetCatalog } from '@/components/assets/asset-catalog';

type AssetsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AssetsPage({ params }: AssetsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('AssetsPage');
  const common = await getTranslations('Common');

  const assets = await fetchPublicAssets();

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-[1880px] flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.4fr_0.9fr] lg:px-10">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                {t('eyebrow')}
              </div>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight lg:text-5xl">
                {t('title')}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                {t('description')}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/judge`}
                  className="rounded-2xl bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
                >
                  {t('judgeCta')}
                </Link>

                <Link
                  href={`/${locale}`}
                  className="rounded-2xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--muted)]/40"
                >
                  {common('backHome')}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--muted)]/30 p-5">
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    {t('heroMetric1Label')}
                  </div>

                  <div className="mt-5 text-4xl font-semibold leading-none">
                    {assets.length}
                  </div>

                  <p className="mt-5 max-w-[18rem] text-base leading-7 text-[var(--muted-foreground)]">
                    {t('heroMetric1Description')}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--muted)]/30 p-5">
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    {t('heroMetric2Label')}
                  </div>

                  <div className="mt-5 text-4xl font-semibold leading-none">
                    KZTE + EP
                  </div>

                  <p className="mt-5 max-w-[18rem] text-base leading-7 text-[var(--muted-foreground)]">
                    {t('heroMetric2Description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AssetCatalog assets={assets} />
      </div>
    </main>
  );
}