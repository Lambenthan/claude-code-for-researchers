import { Sidebar } from "@/components/layout/sidebar";
import { listScenarios } from "@/lib/scenarios";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const scenarios = listScenarios();
  return (
    <div className="flex gap-8">
      <Sidebar scenarios={scenarios} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
