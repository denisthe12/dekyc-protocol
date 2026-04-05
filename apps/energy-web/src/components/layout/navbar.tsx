'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
    <nav className="hidden items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/35 p-1.5 lg:flex">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'relative rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'text-[var(--background)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
            )}
          >
            {active ? (
              <motion.span
                layoutId="navbar-active-pill"
                className="absolute inset-0 rounded-xl bg-[var(--foreground)] shadow-sm"
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                }}
              />
            ) : null}

            <span className="relative z-10">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}