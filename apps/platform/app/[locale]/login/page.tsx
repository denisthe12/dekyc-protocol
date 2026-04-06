'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasPlatformSession } from '@/lib/platform-session';
import { inputClassName, inputClassNamePageLogin } from '@/components/ui/input-class';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasPlatformSession()) {
      router.replace('/overview');
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint =
        mode === 'login'
          ? `${process.env.NEXT_PUBLIC_API_URL}/auth/login`
          : `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const rawText = await res.text();

      if (!res.ok) {
        throw new Error(`${res.status}: ${rawText}`);
      }

      const data = JSON.parse(rawText) as {
        accessToken: string;
      };

      window.localStorage.setItem('dekyc_access_token', data.accessToken);
      router.push('/overview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              DeKYC Platform
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Secure identity access without wallets
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Sign in to your DeKYC account, configure your profile, connect your
              digital signature, and manage what identity data each service may access.
            </p>

            <div className="mt-8 grid gap-4">
              <Feature title="Email + Password Account" />
              <Feature title="Biometric Mock Setup" />
              <Feature title="Digital Signature Based KYC" />
              <Feature title="Scoped Permission Management" />
            </div>
          </div>

          <div className="rounded-[32px] border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
            <div className="flex gap-3">
              <button
                onClick={() => setMode('login')}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  mode === 'login'
                    ? 'bg-white text-black'
                    : 'border border-zinc-700 text-white hover:bg-zinc-800'
                }`}
              >
                Login
              </button>

              <button
                onClick={() => setMode('signup')}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-white text-black'
                    : 'border border-zinc-700 text-white hover:bg-zinc-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClassNamePageLogin} border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-800`}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClassNamePageLogin} border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-800`}
                  placeholder="Enter your password"
                />
              </div>

              <PrimaryButton
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-zinc-200"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'login'
                    ? 'Login to Platform'
                    : 'Create Account'}
              </PrimaryButton>

              {error ? (
                <div className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
      {title}
    </div>
  );
}