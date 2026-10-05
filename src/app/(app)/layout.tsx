import { Sidebar } from "@/components/layout/sidebar";
import { SessionGate } from "@/components/auth/session-context";
import { DuesBanner } from "@/components/layout/dues-banner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGate>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <DuesBanner />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </SessionGate>
  );
}
