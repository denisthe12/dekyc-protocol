'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadEnergySession, clearEnergySession } from '@/lib/session';
import { fetchEnergyMe } from '@/lib/api/energy';

type MeState = Awaited<ReturnType<typeof fetchEnergyMe>> | null;

export default function HomePage() {
  const [me, setMe] = useState<MeState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const session = loadEnergySession();
      if (!session) {
        setMe(null);
        return;
      }

      const data = await fetchEnergyMe(session.accessToken);
      setMe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки профиля');
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout(): void {
    clearEnergySession();
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl text-sm text-zinc-400">Загрузка...</div>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">
              DeKYC Energy
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Сервис токенизации энергетических проектов
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
              Чтобы покупать доли, получать начисления и пользоваться портфелем,
              нужно войти через DeKYC.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                href="/login"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
              >
                Войти через DeKYC
              </Link>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">
                DeKYC Energy
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                Профиль energy-пользователя создан
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
                Теперь у пользователя есть реальный custodial-адрес, реальный
                Token-2022 account для KZTE и стартовое начисление 1 000 000 KZTE.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">Пользователь</div>
            <div className="mt-2 text-xl font-semibold">
              {me.fullName ?? 'Имя не передано'}
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              Email: {me.email ?? 'не указан'}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">IIN</div>
            <div className="mt-2 break-all text-sm text-zinc-300">
              {me.profile?.iin ?? 'не передан'}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">Проверка</div>
            <div className="mt-2 text-sm text-zinc-300">
              verified: {String(me.profile?.verified ?? false)}
            </div>
            <div className="mt-1 text-sm text-zinc-300">
              age18Plus: {String(me.profile?.age18Plus ?? false)}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">Роль</div>
            <div className="mt-2 text-lg font-semibold">{me.role}</div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">Custodial адрес</div>
            <div className="mt-3 break-all text-sm text-zinc-300">
              {me.wallet?.custodialWalletAddress ?? 'не создан'}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">KZTE token account</div>
            <div className="mt-3 break-all text-sm text-zinc-300">
              {me.wallet?.kzteTokenAccountAddress ?? 'не создан'}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">Статус кошелька</div>
            <div className="mt-2 text-lg font-semibold">
              {me.wallet?.walletStatus ?? 'UNKNOWN'}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">Стартовый KZTE airdrop</div>
            <div className="mt-2 text-lg font-semibold">
              {String(me.wallet?.initialKzteAirdropped ?? false)}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="text-sm text-zinc-500">Tx начисления</div>
            <div className="mt-3 break-all text-xs text-zinc-300">
              {me.wallet?.initialKzteAirdropTx ?? 'ещё нет'}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}