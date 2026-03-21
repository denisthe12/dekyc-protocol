'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/profile', label: 'Profile' },
  { href: '/platform-kyc', label: 'KYC' },
  { href: '/platform-permissions', label: 'Permissions' },
];

export function PlatformSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              active
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}