'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadEnergySession } from '@/lib/session';
import {
  fetchActionPasswordStatus,
  setActionPassword,
} from '@/lib/api/settings';

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');

  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSet, setIsSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const session = loadEnergySession();
      if (!session) {
        throw new Error('Energy session not found');
      }

      const status = await fetchActionPasswordStatus(session.accessToken);
      setIsSet(status.isSet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(): Promise<void> {
    try {
      setError(null);
      setSuccess(null);

      if (!password || !confirmPassword) {
        throw new Error(t('errors.required'));
      }

      if (password !== confirmPassword) {
        throw new Error(t('errors.mismatch'));
      }

      const session = loadEnergySession();
      if (!session) {
        throw new Error('Energy session not found');
      }

      setSaving(true);

      await setActionPassword({
        accessToken: session.accessToken,
        password,
      });

      setPasswordValue('');
      setConfirmPassword('');
      setIsSet(true);
      setSuccess(t('saved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">
          {t('eyebrow')}
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {t('title')}
        </h1>

        <p className="mt-4 text-sm leading-7 text-zinc-400">
          {t('description')}
        </p>

        {loading ? (
          <div className="mt-6 text-zinc-400">{t('loading')}</div>
        ) : (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
            {isSet ? t('statusSet') : t('statusNotSet')}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              {t('password')}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPasswordValue(event.target.value)}
              placeholder={t('passwordPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              {t('confirmPassword')}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={t('confirmPasswordPlaceholder')}
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-2xl border border-emerald-900 bg-emerald-950/40 p-4 text-sm text-emerald-300">
            {success}
          </div>
        ) : null}

        <div className="mt-6">
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>
    </main>
  );
}