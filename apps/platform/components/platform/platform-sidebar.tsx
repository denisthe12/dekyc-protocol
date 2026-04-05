'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';
import {clearPlatformSession} from '@/lib/platform-session';

const localePrefixRegex = /^\/(ru|en)(?=\/|$)/;

export function PlatformSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('PlatformSidebar');

  const items = [
    {href: '/overview', label: t('overview')},
    {href: '/demo-guide', label: t('demoGuide')},
    {href: '/profile', label: t('profile')},
    {href: '/platform-kyc', label: t('kyc')},
    {href: '/platform-permissions', label: t('permissions')},
  ];

  const handleLogout = () => {
    clearPlatformSession();
    router.push('/login');
  };

  const switchLocale = (nextLocale: 'ru' | 'en') => {
    const pathWithoutLocale = pathname.replace(localePrefixRegex, '') || '/';
    router.push(`/${nextLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex h-full flex-col">
      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const localizedHref = `/${locale}${item.href}`;
          const active = pathname === localizedHref;

          return (
            <Link
              key={item.href}
              href={localizedHref}
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
        <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t('language')}
        </div>

        <div className="flex gap-2 px-3">
          <button
            onClick={() => switchLocale('ru')}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              locale === 'ru'
                ? 'bg-zinc-900 text-white'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {t('russian')}
          </button>

          <button
            onClick={() => switchLocale('en')}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              locale === 'en'
                ? 'bg-zinc-900 text-white'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {t('english')}
          </button>
        </div>
      </div>

      <div className="mt-6 border-t border-zinc-200 pt-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-100"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  );
}