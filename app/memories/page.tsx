import { AddMemoryButton } from "@/components/memories/AddMemoryButton";
import { MemoryTimeline } from "@/components/memories/MemoryTimeline";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Memory Jar — Us Dashboard",
  description: "Your shared memories and special moments",
};

export default function MemoriesPage() {
  return (
    <>
      <PageHeader title="Memory Jar ✨" />
      <div className="page-container mt-4 space-y-4">
        <AddMemoryButton />
        <MemoryTimeline />
      </div>
    </>
  );
}
