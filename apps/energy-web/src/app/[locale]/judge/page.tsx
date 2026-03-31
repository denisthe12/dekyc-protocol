import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { fetchJudgeSummary } from '@/lib/api/judge';

type JudgePageProps = {
  params: Promise<{ locale: string }>;
};

function explorerAddressUrl(address: string | null): string | null {
  if (!address) {
    return null;
  }

  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

function explorerTxUrl(signature: string | null): string | null {
  if (!signature) {
    return null;
  }

  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export default async function JudgePage({ params }: JudgePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'JudgePage' });
  const common = await getTranslations({ locale, namespace: 'Common' });

  const summary = await fetchJudgeSummary();

  const programUrl = explorerAddressUrl(summary.solana.tokenizationProgramId);
  const signerUrl = explorerAddressUrl(summary.solana.signerAddress);
  const mintUrl = explorerAddressUrl(summary.kzte.mintAddress);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">
                {t('eyebrow')}
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                {t('title')}
              </h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-zinc-400">
                {t('description')}
              </p>
              <div className="mt-4 text-sm text-zinc-500">
                {t('generatedAt')}: {new Date(summary.generatedAt).toLocaleString()}
              </div>
            </div>

            <Link
              href={`/${locale}`}
              className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              {common('backHome')}
            </Link>
          </div>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-semibold">{t('solana')}</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-500">RPC</div>
              <div className="mt-2 break-all text-xs text-zinc-300">
                {summary.solana.rpcUrl}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-500">{t('signer')}</div>
              <div className="mt-2 break-all text-xs text-zinc-300">
                {summary.solana.signerAddress}
              </div>
              {signerUrl ? (
                <a
                  href={signerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-zinc-400 underline"
                >
                  {t('openExplorer')}
                </a>
              ) : null}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-500">{t('programId')}</div>
              <div className="mt-2 break-all text-xs text-zinc-300">
                {summary.solana.tokenizationProgramId}
              </div>
              {programUrl ? (
                <a
                  href={programUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-zinc-400 underline"
                >
                  {t('openExplorer')}
                </a>
              ) : null}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-500">{t('mint')}</div>
              <div className="mt-2 break-all text-xs text-zinc-300">
                {summary.kzte.mintAddress ?? '—'}
              </div>
              <div className="mt-2 text-xs text-zinc-400">
                {t('supply')}: {summary.kzte.supply ?? '—'}
              </div>
              {mintUrl ? (
                <a
                  href={mintUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-zinc-400 underline"
                >
                  {t('openExplorer')}
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-semibold">{t('users')}</h2>

          {summary.users.length === 0 ? (
            <div className="mt-6 text-zinc-400">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {summary.users.map((user) => (
                <article
                  key={user.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-zinc-500">User ID</div>
                      <div className="mt-2 break-all text-xs text-zinc-300">{user.id}</div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500">Name</div>
                      <div className="mt-2 text-sm text-zinc-300">{user.fullName ?? '—'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500">Email</div>
                      <div className="mt-2 text-sm text-zinc-300">{user.email ?? '—'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500">Wallet</div>
                      <div className="mt-2 break-all text-xs text-zinc-300">
                        {user.wallet?.custodialWalletAddress ?? '—'}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-semibold">{t('assets')}</h2>

          {summary.assets.length === 0 ? (
            <div className="mt-6 text-zinc-400">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-6">
              {summary.assets.map((asset) => (
                <article
                  key={asset.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                >
                  <div className="text-xl font-semibold">{asset.title}</div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-zinc-500">Asset ID</div>
                      <div className="mt-2 text-sm text-zinc-300">{asset.assetId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Shares</div>
                      <div className="mt-2 text-sm text-zinc-300">{asset.totalShares}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Price</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {asset.pricePerShareKzte} KZTE
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Status</div>
                      <div className="mt-2 text-sm text-zinc-300">{asset.status}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="text-xs text-zinc-500">{t('metadataHash')}</div>
                      <div className="mt-2 break-all text-xs text-zinc-300">
                        {asset.metadataUriHash}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">{t('canonicalJson')}</div>
                      <pre className="mt-2 overflow-x-auto rounded-xl border border-zinc-800 bg-black/20 p-3 text-xs text-zinc-300">
                        {asset.metadataCanonicalJson}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {explorerTxUrl(asset.createAssetTx) ? (
                      <a
                        href={explorerTxUrl(asset.createAssetTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black"
                      >
                        Create asset tx
                      </a>
                    ) : null}

                    {explorerTxUrl(asset.issueSharesTx) ? (
                      <a
                        href={explorerTxUrl(asset.issueSharesTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
                      >
                        Issue shares tx
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-semibold">{t('positions')}</h2>

          {summary.positions.length === 0 ? (
            <div className="mt-6 text-zinc-400">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {summary.positions.map((position) => (
                <article
                  key={position.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-zinc-500">Asset ID</div>
                      <div className="mt-2 text-sm text-zinc-300">{position.assetId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Shares</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {position.totalSharesPurchased}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Spent</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {position.totalKzteSpent}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Average price</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {position.averagePricePerShare}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-semibold">{t('epochs')}</h2>

          {summary.epochs.length === 0 ? (
            <div className="mt-6 text-zinc-400">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {summary.epochs.map((epoch) => (
                <article
                  key={epoch.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-zinc-500">Epoch</div>
                      <div className="mt-2 text-sm text-zinc-300">{epoch.epochIndex}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Amount/share</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {epoch.amountPerShareKzte}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Total amount</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {epoch.totalAmountKzte}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Snapshot</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {epoch.totalSharesSnapshot}
                      </div>
                    </div>
                  </div>

                  {explorerTxUrl(epoch.createEpochTx) ? (
                    <div className="mt-4">
                      <a
                        href={explorerTxUrl(epoch.createEpochTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
                      >
                        Create epoch tx
                      </a>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-semibold">{t('claims')}</h2>

          {summary.claims.length === 0 ? (
            <div className="mt-6 text-zinc-400">{t('empty')}</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {summary.claims.map((claim) => (
                <article
                  key={claim.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <div className="text-xs text-zinc-500">User</div>
                      <div className="mt-2 break-all text-xs text-zinc-300">
                        {claim.energyUserId}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Amount</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {claim.claimedAmountKzte}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Claim receipt</div>
                      <div className="mt-2 break-all text-xs text-zinc-300">
                        {claim.claimReceiptPda}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Created</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {new Date(claim.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {explorerTxUrl(claim.claimTx) ? (
                    <div className="mt-4">
                      <a
                        href={explorerTxUrl(claim.claimTx)!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black"
                      >
                        Claim tx
                      </a>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}