'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = DialogPrimitive.Content;
export const DialogOverlay = DialogPrimitive.Overlay;

export function StyledDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />

      <DialogContent
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl',
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}