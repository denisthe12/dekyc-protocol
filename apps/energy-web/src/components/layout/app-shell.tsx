'use client';

import { Navbar } from './navbar';
import { ProfileDropdown } from './profile-dropdown';
import { ThemeToggle } from './theme-toggle';
import { LocaleSwitcher } from './locale-switcher';
import { ToastProvider, ToastViewport } from '../ui/toast';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadEnergySession } from '@/lib/session';

function isWideRoute(pathname: string): boolean {
  return (
    pathname.includes('/assets') ||
    pathname.includes('/judge') ||
    pathname.includes('/otc')
  );
}

export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const pathname = usePathname();
  const wide = isWideRoute(pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = loadEnergySession();
    setIsAuthenticated(Boolean(session?.accessToken));
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <header className="sticky top-0 z-40 px-4 pt-4">
          <div className="mx-auto flex max-w-[1880px] items-center justify-between rounded-[28px] border border-[var(--border)] bg-[var(--background)]/80 px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--background)]/70">
            <div className="flex items-center gap-4 xl:gap-8">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--foreground)] text-sm font-bold text-[var(--background)]">
                  DE
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold tracking-tight">
                    DeKYC Energy
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Energy Rights Exchange
                  </div>
                </div>
              </div>

              <Navbar />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/35 px-2 py-2">
              <LocaleSwitcher />
              <ThemeToggle />
              {isAuthenticated ? <ProfileDropdown email={email} /> : null}
            </div>
          </div>
        </header>

        <main
          className={
            wide
              ? 'w-full px-6 py-6 xl:px-8 2xl:px-10'
              : 'mx-auto max-w-7xl px-6 py-6'
          }
        >
          {children}
        </main>
      </div>

      <ToastViewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" />
    </ToastProvider>
  );
}