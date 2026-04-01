import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-[var(--input)] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };