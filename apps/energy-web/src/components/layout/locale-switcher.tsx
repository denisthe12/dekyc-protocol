'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  function switchLocale(nextLocale: 'ru' | 'en') {
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length > 0 && (segments[0] === 'ru' || segments[0] === 'en')) {
      segments[0] = nextLocale;
    } else {
      segments.unshift(nextLocale);
    }

    router.push(`/${segments.join('/')}`);
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-1">
      {(['ru', 'en'] as const).map((item) => {
        const active = locale === item;

        return (
          <button
            key={item}
            type="button"
            onClick={() => switchLocale(item)}
            className={cn(
              'relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'text-[var(--background)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
            )}
          >
            {active ? (
              <motion.span
                layoutId="locale-active-pill"
                className="absolute inset-0 rounded-lg bg-[var(--foreground)]"
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                }}
              />
            ) : null}

            <span className="relative z-10 uppercase">{item}</span>
          </button>
        );
      })}
    </div>
  );
}