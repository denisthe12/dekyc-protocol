'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatKzte } from '@/lib/formatters';
import type { HistoryItem } from '@/lib/api/history';

type HistoryTabsProps = {
  items: HistoryItem[];
};

type HistoryTab = 'ALL' | 'PRIMARY_BUY' | 'OTC' | 'CLAIM';

function explorerTxUrl(signature: string | null): string | null {
  if (!signature) return null;
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export function HistoryTabs({ items }: HistoryTabsProps) {
  const t = useTranslations('HistoryPage');
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<HistoryTab>('ALL');

  const filteredItems = useMemo(() => {
    if (activeTab === 'ALL') {
      return items;
    }

    if (activeTab === 'PRIMARY_BUY') {
      return items.filter((item) => item.type === 'PRIMARY_BUY');
    }

    if (activeTab === 'OTC') {
      return items.filter(
        (item) =>
          item.type === 'OTC_LISTING_CREATED' ||
          item.type === 'OTC_LISTING_FILLED',
      );
    }

    return items.filter((item) => item.type === 'CLAIM');
  }, [items, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <HistoryTabButton
          active={activeTab === 'ALL'}
          onClick={() => setActiveTab('ALL')}
          label={t('tabs.all')}
        />
        <HistoryTabButton
          active={activeTab === 'PRIMARY_BUY'}
          onClick={() => setActiveTab('PRIMARY_BUY')}
          label={t('tabs.primaryBuy')}
        />
        <HistoryTabButton
          active={activeTab === 'OTC'}
          onClick={() => setActiveTab('OTC')}
          label={t('tabs.otc')}
        />
        <HistoryTabButton
          active={activeTab === 'CLAIM'}
          onClick={() => setActiveTab('CLAIM')}
          label={t('tabs.claims')}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center text-[var(--muted-foreground)] shadow-sm">
          {t('emptyTab')}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-2">
          {filteredItems.map((item) => {
            const txUrl = explorerTxUrl(item.tx);
            const secondaryTxUrl = explorerTxUrl(item.secondaryTx);

            return (
              <article
                key={item.id}
                className="flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                    {labelForType(item.type, t)}
                  </span>

                  {item.payoutMode ? (
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                      {item.payoutMode}
                    </span>
                  ) : null}

                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                    Asset {item.assetId}
                  </span>
                </div>

                <div className="mt-5">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {new Date(item.createdAt).toLocaleString(
                      locale === 'en' ? 'en-US' : 'ru-RU',
                    )}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <HistoryMetricTile
                    label={t('amount')}
                    value={
                      item.amountBaseUnits !== null
                        ? `${formatKzte(item.amountBaseUnits, locale === 'en' ? 'en' : 'ru')} KZTE`
                        : '—'
                    }
                  />
                  <HistoryMetricTile
                    label={t('shares')}
                    value={item.shareAmount !== null ? `${item.shareAmount}` : '—'}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {txUrl ? (
                    <a
                      href={txUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
                    >
                      {t('primaryTx')}
                    </a>
                  ) : null}

                  {secondaryTxUrl ? (
                    <a
                      href={secondaryTxUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--muted)]/40"
                    >
                      {t('secondaryTx')}
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HistoryTabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-2xl bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition hover:opacity-90'
          : 'rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--muted)]/40'
      }
    >
      {label}
    </button>
  );
}

function HistoryMetricTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className="mt-3 break-all text-sm font-semibold text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

function labelForType(
  type: HistoryItem['type'],
  t: ReturnType<typeof useTranslations<'HistoryPage'>>,
): string {
  switch (type) {
    case 'PRIMARY_BUY':
      return t('labels.primaryBuy');
    case 'OTC_LISTING_CREATED':
      return t('labels.otcCreated');
    case 'OTC_LISTING_FILLED':
      return t('labels.otcFilled');
    case 'CLAIM':
      return t('labels.claim');
    default:
      return type;
  }
}