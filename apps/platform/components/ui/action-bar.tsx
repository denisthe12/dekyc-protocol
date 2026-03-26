import { ReactNode } from 'react';

type ActionBarProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export function ActionBar({
  title,
  description,
  actions,
}: ActionBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 md:flex-row md:items-center md:justify-between">
      <div>
        {title ? (
          <div className="text-sm font-semibold text-zinc-900">{title}</div>
        ) : null}
        {description ? (
          <div className="mt-1 text-sm leading-6 text-zinc-600">
            {description}
          </div>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}