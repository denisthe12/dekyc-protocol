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

export function ProfileDropdown({ email }: { email?: string }) {
  const t = useTranslations('ProfileDropdown');
  const locale = useLocale();

  const initial = email?.[0]?.toUpperCase() ?? 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
            {initial}
          </div>
          <span>▾</span>
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

        <StyledDropdownMenuItem className="text-red-400">
          {t('logout')}
        </StyledDropdownMenuItem>
      </StyledDropdownMenuContent>
    </DropdownMenu>
  );
}