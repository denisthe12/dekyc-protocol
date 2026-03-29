'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadEnergySession, clearEnergySession } from '@/lib/session';
import { fetchEnergyMe } from '@/lib/api/energy';

type MeState = {
  id: string;
  dekycUserId: string;
  email: string | null;
  fullName: string | null;
  role: string;
} | null;

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
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">
                DeKYC Energy
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                Сессия создана
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
                Следующим шагом мы создадим профиль, кошелёк пользователя,
                стартовый баланс KZTE и защищённые страницы assets / marketplace /
                portfolio.
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

        <div className="grid gap-4 md:grid-cols-2">
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
            <div className="text-sm text-zinc-500">DeKYC User ID</div>
            <div className="mt-2 break-all text-sm text-zinc-300">
              {me.dekycUserId}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}