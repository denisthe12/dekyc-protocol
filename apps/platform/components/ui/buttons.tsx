import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 ${className}`}
    />
  );
}

export function SecondaryButton({ className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-50 ${className}`}
    />
  );
}