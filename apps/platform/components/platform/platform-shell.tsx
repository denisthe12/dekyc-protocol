import { ReactNode } from 'react';
import { PlatformSidebar } from './platform-sidebar';
import { PageHero } from '@/components/ui/page-hero';

type PlatformShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PlatformShell({
  title,
  description,
  children,
}: PlatformShellProps) {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-6">
            <div className="text-sm font-semibold text-zinc-950">
              DeKYC Platform
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              User application
            </div>
          </div>

          <PlatformSidebar />
        </aside>

        <section className="space-y-6">
          <PageHero
            eyebrow="User Platform"
            title={title}
            description={description}
          />

          {children}
        </section>
      </div>
    </main>
  );
}