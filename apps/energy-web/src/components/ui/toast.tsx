'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = ToastPrimitive.Viewport;

export function Toast({
  title,
  description,
  variant = 'default',
}: {
  title: string;
  description?: string;
  variant?: 'default' | 'error';
}) {
  return (
    <ToastPrimitive.Root
      className={cn(
        'rounded-xl border p-4 shadow-lg',
        variant === 'error'
          ? 'border-red-500 bg-red-950 text-red-200'
          : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]',
      )}
    >
      <div className="font-semibold">{title}</div>
      {description && (
        <div className="text-sm text-[var(--muted-foreground)]">
          {description}
        </div>
      )}
    </ToastPrimitive.Root>
  );
}