'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = DropdownMenuPrimitive.Content;
const DropdownMenuItem = DropdownMenuPrimitive.Item;
const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};

export function StyledDropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      sideOffset={8}
      className={cn(
        'z-50 min-w-[12rem] rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-2 text-[var(--popover-foreground)] shadow-lg',
        className,
      )}
      {...props}
    />
  );
}

export function StyledDropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      className={cn(
        'flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm outline-none transition hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
        className,
      )}
      {...props}
    />
  );
}

export function StyledDropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      className={cn('my-1 h-px bg-[var(--border)]', className)}
      {...props}
    />
  );
}