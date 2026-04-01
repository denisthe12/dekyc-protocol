'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { fetchHistory, HistoryItem } from '@/lib/api/history';
import { fetchEnergyMe } from '@/lib/api/energy';
import { loadEnergySession } from '@/lib/session';

function explorerTxUrl(signature: string | null): string | null {
  if (!signature) {
    return null;
  }

  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export default function HistoryPage() {
  const locale = useLocale();
  const t = useTranslations('HistoryPage');
  const common = useTranslations('Common');

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadPage();
  }, []);

  async function loadPage(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const session = loadEnergySession();
      if (!session) {
        throw new Error('Energy session not found');
      }

      const me = await fetchEnergyMe(session.accessToken);
      const data = await fetchHistory(me.id);

      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
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

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
            {common('loading')}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-900 bg-red-950/40 p-8 text-red-300">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
            {t('empty')}
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => {
              const txUrl = explorerTxUrl(item.txSignature);

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {t(`types.${item.type}`)}
                    </div>

                    <div className="text-xs text-zinc-500">
                      {new Date(item.createdAt).toLocaleString(locale)}
                    </div>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold">{item.title}</h2>

                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    {item.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {item.assetId ? (
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
                        Asset ID: {item.assetId}
                      </div>
                    ) : null}

                    {txUrl ? (
                      <a
                        href={txUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                      >
                        {t('openTx')}
                      </a>
                    ) : null}
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