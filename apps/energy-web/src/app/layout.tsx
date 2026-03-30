import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DeKYC Energy',
  description: 'Energy rights tokenization service powered by DeKYC',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}