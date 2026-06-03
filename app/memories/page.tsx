import { KindActsHistory } from "@/components/memories/KindActsHistory";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
    title: "Kind Acts — Us Dashboard",
    description: "View your kind acts history",
};

export default function MemoriesPage() {
    return (
        <>
            <PageHeader title="Kind Acts" />
            <div className="page-container mt-4">
                <KindActsHistory />
            </div>
        </>
    );
}
