import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DeKYC Energy',
  description: 'Energy rights tokenization service powered by DeKYC',
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}