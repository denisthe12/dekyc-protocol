'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ProfileDropdown({ email }: { email?: string }) {
  const t = useTranslations('ProfileDropdown');
  const [open, setOpen] = useState(false);

  const initial = email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black font-medium">
          {initial}
        </div>
        <span className="text-zinc-300">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-lg">
          <DropdownItem label={t('profile')} />
          <DropdownItem label={t('history')} />
          <DropdownItem label={t('settings')} />
          <DropdownItem label={t('logout')} danger />
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  label,
  danger,
}: {
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-zinc-300 hover:bg-zinc-800'
      }`}
    >
      {label}
    </button>
  );
}