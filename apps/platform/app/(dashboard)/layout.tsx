import { ReactNode } from 'react';
import { DashboardAuthGuard } from '@/components/dashboard/dashboard-auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardAuthGuard>{children}</DashboardAuthGuard>;
}