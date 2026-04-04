import type { ReactNode } from 'react';

type WideLayoutProps = {
  children: ReactNode;
};

export default function WideLayout({ children }: WideLayoutProps) {
  return (
    <main className="w-full px-6 py-6 xl:px-8 2xl:px-10">
      {children}
    </main>
  );
}