import { ReactNode } from 'react';

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: PageHeroProps) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(24,24,27,0.06),transparent_35%)]" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {eyebrow ? (
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {eyebrow}
            </div>
          ) : null}

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            {title}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
            {description}
          </p>
        </div>

        {actions ? <div className="relative">{actions}</div> : null}
      </div>
    </header>
  );
}