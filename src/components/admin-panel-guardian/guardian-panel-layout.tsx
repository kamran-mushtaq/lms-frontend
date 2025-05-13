// components/admin-panel-guardian/guardian-panel-layout.tsx
import { GuardianSidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface GuardianPanelLayoutProps {
  children: React.ReactNode;
}

export default function GuardianPanelLayout({ 
  children 
}: GuardianPanelLayoutProps) {
  return (
    <>
      <GuardianSidebar />
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          "lg:ml-56" // This should match the sidebar width
        )}
      >
        {children}
      </main>
    </>
  );
}
