'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const locale = useLocale();

  const links = [
    { href: `/${locale}/assets`, label: t('assets') },
    { href: `/${locale}/otc`, label: t('otc') },
    { href: `/${locale}/portfolio`, label: t('portfolio') },
    { href: `/${locale}/history`, label: t('history') },
    { href: `/${locale}/judge`, label: t('judge') },
  ];

  return (
    <nav className="flex items-center gap-6">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-sm transition',
              active ? 'text-white' : 'text-zinc-400 hover:text-white',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}