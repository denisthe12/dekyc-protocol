import { ReactNode } from 'react';
import { PlatformAuthGuard } from '@/components/platform/platform-auth-guard';

export default function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PlatformAuthGuard>{children}</PlatformAuthGuard>;
}