'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasPlatformSession } from '@/lib/platform-session';

type PlatformAuthGuardProps = {
  children: ReactNode;
};

export function PlatformAuthGuard({ children }: PlatformAuthGuardProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasPlatformSession()) {
      router.replace('/login');
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="text-sm text-zinc-500">Checking session...</div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}