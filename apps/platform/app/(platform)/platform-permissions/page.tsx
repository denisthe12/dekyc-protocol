import { PlatformShell } from '@/components/platform/platform-shell';
import { SectionCard } from '@/components/dashboard/section-card';

export default function PlatformPermissionsPage() {
  return (
    <PlatformShell
      title="Permissions"
      description="This page will show the user-facing permission creation flow."
    >
      <SectionCard
        title="Coming next"
        description="We will build required claims, optional claims, and revoke flow here."
      >
        <div className="text-sm text-zinc-500">
          Next step: user-facing service selection and grant UX.
        </div>
      </SectionCard>
    </PlatformShell>
  );
}