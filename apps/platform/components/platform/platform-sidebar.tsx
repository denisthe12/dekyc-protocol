'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearPlatformSession } from '@/lib/platform-session';

const items = [
  { href: '/overview', label: 'Overview' },
  { href: '/demo-guide', label: 'Demo Guide' },
  { href: '/profile', label: 'Profile' },
  { href: '/platform-kyc', label: 'KYC' },
  { href: '/platform-permissions', label: 'Permissions' },
];

export function PlatformSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearPlatformSession();
    router.push('/login');
  };

  return (
    <div className="flex h-full flex-col">
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

      <div className="mt-8 border-t border-zinc-200 pt-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
}