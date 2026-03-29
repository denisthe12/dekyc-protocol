'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEnergySessionViaDekyc } from '@/lib/api/energy';
import { loadEnergySession, saveEnergySession } from '@/lib/session';
import { DEKYC_CLIENT_ID, DEKYC_SERVICE_ID } from '@/lib/config';

export default function LoginPage() {
  const router = useRouter();

  const [loginCode, setLoginCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadEnergySession();
    if (existing) {
      router.replace('/');
    }
  }, [router]);

  async function handleLogin(): Promise<void> {
    if (!DEKYC_SERVICE_ID) {
      setError('Не задан NEXT_PUBLIC_DEKYC_SERVICE_ID');
      return;
    }

    if (!DEKYC_CLIENT_ID) {
      setError('Не задан NEXT_PUBLIC_DEKYC_CLIENT_ID');
      return;
    }

    if (!loginCode.trim()) {
      setError('Введи код входа');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const session = await createEnergySessionViaDekyc({
        biometricMockId: `energy-face-${Date.now()}`,
        loginCode: loginCode.trim(),
      });

      saveEnergySession(session);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">
            DeKYC Energy
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Вход через DeKYC
          </h1>

          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Теперь вход идёт через energy-api. Браузер больше не знает сервисный
            секрет DeKYC.
          </p>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="text-sm text-zinc-500">Подключённый сервис</div>
            <div className="mt-2 text-base font-medium text-white">
              Auto Marketplace
            </div>
            <div className="mt-2 break-all text-xs text-zinc-500">
              serviceId: {DEKYC_SERVICE_ID || 'не задан'}
            </div>
            <div className="mt-1 break-all text-xs text-zinc-500">
              clientId: {DEKYC_CLIENT_ID || 'не задан'}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <label className="block">
              <div className="mb-2 text-sm text-zinc-300">Код входа</div>
              <input
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                placeholder="DK-..."
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </label>

            <button
              type="button"
              onClick={() => void handleLogin()}
              disabled={submitting}
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Входим...' : 'Войти через DeKYC'}
            </button>

            {error ? (
              <div className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-2xl font-semibold">Что изменилось</h2>
          <div className="mt-6 space-y-3 text-sm leading-7 text-zinc-400">
            <p>1. Браузер больше не знает clientSecret.</p>
            <p>2. Вызов DeKYC теперь делает только energy-api.</p>
            <p>3. На фронт возвращается уже готовая JWT-сессия energy-сервиса.</p>
          </div>
        </div>
      </div>
    </main>
  );
}