'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  StyledDropdownMenuContent,
  StyledDropdownMenuItem,
  StyledDropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { clearEnergySession } from '@/lib/session';

export function ProfileDropdown({ email }: { email?: string }) {
  const t = useTranslations('ProfileDropdown');
  const locale = useLocale();
  const router = useRouter();

  const initial = email?.[0]?.toUpperCase() ?? 'U';

  function handleLogout() {
    clearEnergySession();
    router.push(`/${locale}/login`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-full border-[var(--border)] bg-[var(--background)]/60 px-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-semibold text-[var(--background)]">
            {initial}
          </div>
          <span className="text-[var(--muted-foreground)]">▾</span>
        </Button>
      </DropdownMenuTrigger>

      <StyledDropdownMenuContent align="end">
        <StyledDropdownMenuItem asChild>
          <Link href={`/${locale}/profile`}>{t('profile')}</Link>
        </StyledDropdownMenuItem>

        <StyledDropdownMenuItem asChild>
          <Link href={`/${locale}/history`}>{t('history')}</Link>
        </StyledDropdownMenuItem>

        <StyledDropdownMenuItem asChild>
          <Link href={`/${locale}/settings`}>{t('settings')}</Link>
        </StyledDropdownMenuItem>

        <StyledDropdownMenuSeparator />

        <StyledDropdownMenuItem className="text-red-400" onClick={handleLogout}>
          {t('logout')}
        </StyledDropdownMenuItem>
      </StyledDropdownMenuContent>
    </DropdownMenu>
  );
}