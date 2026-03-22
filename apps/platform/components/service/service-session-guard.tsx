'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadServiceSession,
  ServiceSession,
} from '@/lib/service-session';

type ServiceSessionGuardProps = {
  children: (session: ServiceSession) => ReactNode;
  redirectTo?: string;
};

export function ServiceSessionGuard({
  children,
  redirectTo = '/service-login',
}: ServiceSessionGuardProps) {
  const router = useRouter();
  const [session, setSession] = useState<ServiceSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = loadServiceSession();

    if (!existing) {
      router.replace(redirectTo);
      return;
    }

    setSession(existing);
    setLoading(false);
  }, [redirectTo, router]);

  if (loading || !session) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="text-sm text-zinc-400">Checking service session...</div>
        </div>
      </main>
    );
  }

  return <>{children(session)}</>;
}