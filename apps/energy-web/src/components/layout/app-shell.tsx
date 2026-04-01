import { Navbar } from './navbar';
import { ProfileDropdown } from './profile-dropdown';
import { ThemeToggle } from './theme-toggle';
import { LocaleSwitcher } from './locale-switcher';
import { ToastProvider, ToastViewport } from '../ui/toast';

export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-10">
              <div className="text-lg font-semibold tracking-tight">
                DeKYC Energy
              </div>
              <Navbar />
            </div>

            <div className="flex items-center gap-4">
              <LocaleSwitcher />
              <ThemeToggle />
              <ProfileDropdown email={email} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
      </div>
      <ToastViewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" />
    </ToastProvider>
  );
}