import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchAssets } from '@/lib/api/assets';

type AssetsPageProps = {
  params: Promise<{ locale: string }>;
};

function explorerTxUrl(signature: string | null): string | null {
  if (!signature) {
    return null;
  }

  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export default async function AssetsPage({ params }: AssetsPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'AssetsPage' });
  const common = await getTranslations({ locale, namespace: 'Common' });

  const assets = await fetchAssets();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">
                {t('eyebrow')}
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                {t('title')}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
                {t('description')}
              </p>
            </div>

            <Link
              href={`/${locale}`}
              className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              {common('backHome')}
            </Link>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
            {t('empty')}
          </div>
        ) : (
          <div className="grid gap-6">
            {assets.map((asset) => {
              const createTxUrl = explorerTxUrl(asset.createAssetTx);
              const issueTxUrl = explorerTxUrl(asset.issueSharesTx);

              return (
                <article
                  key={asset.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
                >
                  <div className="flex flex-col gap-6">
                    <div>
                      <div className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                        {asset.assetType}
                      </div>
                      <Link href={`/${locale}/assets/${asset.assetId}`} className="mt-3 block text-2xl font-semibold transition hover:text-zinc-300">
                        {asset.title}
                      </Link>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                        {asset.description ?? '—'}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('location')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {asset.location ?? '—'}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('totalShares')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {asset.totalShares}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('pricePerShare')}</div>
                        <div className="mt-2 text-sm text-zinc-300">
                          {asset.pricePerShareKzte} KZTE
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('status')}</div>
                        <div className="mt-2 text-sm text-zinc-300">{asset.status}</div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('registryPda')}</div>
                        <div className="mt-2 break-all text-xs text-zinc-300">
                          {asset.registryPda}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('assetPda')}</div>
                        <div className="mt-2 break-all text-xs text-zinc-300">
                          {asset.assetPda}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('shareMint')}</div>
                        <div className="mt-2 break-all text-xs text-zinc-300">
                          {asset.shareMintAddress}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-xs text-zinc-500">{t('treasury')}</div>
                        <div className="mt-2 break-all text-xs text-zinc-300">
                          {asset.treasuryShareAccount}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {createTxUrl ? (
                        <a
                          href={createTxUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                        >
                          {t('createAssetTx')}
                        </a>
                      ) : null}

                      {issueTxUrl ? (
                        <a
                          href={issueTxUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                        >
                          {t('issueSharesTx')}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}