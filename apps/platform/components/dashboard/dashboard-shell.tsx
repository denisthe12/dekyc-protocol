import { ReactNode } from 'react';
import { SidebarNav } from './sidebar-nav';
import { PageHero } from '@/components/ui/page-hero';

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
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-6">
            <div className="text-sm font-semibold text-zinc-950">
              DeKYC Protocol
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Judge & developer console
            </div>
          </div>

          <SidebarNav />
        </aside>

        <section className="space-y-6">
          <PageHero
            eyebrow="Protocol Console"
            title={title}
            description={description}
          />

          {children}
        </section>
      </div>
    </main>
  );
}