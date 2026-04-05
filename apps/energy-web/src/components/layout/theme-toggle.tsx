'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl border-[var(--border)] bg-[var(--background)]/60"
      >
        •••
      </Button>
    );
  }

  const isDark = theme !== 'light';

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-xl border-[var(--border)] bg-[var(--background)]/60 px-3 transition hover:bg-[var(--muted)]/50"
    >
      <span className="text-base">{isDark ? '🌙' : '☀️'}</span>
    </Button>
  );
}