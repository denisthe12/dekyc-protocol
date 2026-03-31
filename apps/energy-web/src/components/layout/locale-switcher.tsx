'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

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
    <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-2 py-1">
      <button
        type="button"
        onClick={() => switchLocale('ru')}
        className={`rounded-md px-2 py-1 text-sm transition ${
          locale === 'ru' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
        }`}
      >
        RU
      </button>

      <button
        type="button"
        onClick={() => switchLocale('en')}
        className={`rounded-md px-2 py-1 text-sm transition ${
          locale === 'en' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}