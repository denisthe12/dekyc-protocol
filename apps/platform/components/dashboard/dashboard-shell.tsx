import { ReactNode } from 'react';
import { SidebarNav } from './sidebar-nav';

type DashboardShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function DashboardShell({
  title,
  description,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-6">
            <div className="text-sm font-semibold text-zinc-900">
              Decentralized KYC
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Access Protocol Demo
            </div>
          </div>

          <SidebarNav />
        </aside>

        <section className="space-y-6">
          <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600">
              {description}
            </p>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}