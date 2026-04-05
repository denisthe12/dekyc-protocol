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

  const initial = email?.[0]?.toUpperCase() ?? 'U';
  const router = useRouter();
  
  function handleLogout(){
    clearEnergySession();
    router.push(`/${locale}/login`)
  }

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

        <StyledDropdownMenuItem className="text-red-400" onClick={handleLogout}>
          {t('logout')}
        </StyledDropdownMenuItem>
      </StyledDropdownMenuContent>
    </DropdownMenu>
  );
}