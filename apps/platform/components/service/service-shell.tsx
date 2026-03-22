import { ReactNode } from 'react';

type ServiceShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ServiceShell({
  title,
  description,
  children,
}: ServiceShellProps) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Consumer Service Demo
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm text-zinc-400">{description}</p>
        </header>

        <section className="mt-6">{children}</section>
      </div>
    </main>
  );
}