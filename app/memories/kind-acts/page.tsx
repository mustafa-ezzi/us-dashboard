import { KindActsHistory } from "@/components/memories/KindActsHistory";
import { PageHeader } from "@/components/ui/PageHeader";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Kind Acts History — Us Dashboard",
  description: "View your kind acts history",
};

export default function KindActsPage() {
  return (
    <>
      <PageHeader title="Kind Acts 💕" />
      <div className="page-container mt-4 space-y-4">
        {/* <Link 
          href="/memories" 
          className="inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 font-medium"
        >
          <ChevronLeft size={16} />
          Back to Memories Hub
        </Link> */}
        <KindActsHistory />
      </div>
    </>
  );
}
