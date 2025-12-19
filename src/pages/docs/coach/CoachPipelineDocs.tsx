import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { Kanban, Users, ArrowRight, Target, FileText } from "lucide-react";

export default function CoachPipelineDocs() {
  return (
    <DocsLayout
      title="Sales Pipeline"
      description="Track leads and convert prospects into paying clients."
      breadcrumbs={[{ label: "For Coaches", href: "/docs/coach" }, { label: "Sales Pipeline" }]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Kanban className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The Sales Pipeline helps you track potential clients from first contact to conversion.
          Manage leads through stages: New Lead → Contacted → Offer Sent → Closed Won/Lost.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Pipeline Stages</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1 flex items-center gap-2"><Users className="h-4 w-4" /> New Lead</h3>
            <p className="text-sm text-muted-foreground">Prospects who have shown interest but haven't been contacted yet.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1 flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Contacted</h3>
            <p className="text-sm text-muted-foreground">You've reached out and started a conversation.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1 flex items-center gap-2"><FileText className="h-4 w-4" /> Offer Sent</h3>
            <p className="text-sm text-muted-foreground">A proposal or package has been shared with the prospect.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1 flex items-center gap-2"><Target className="h-4 w-4" /> Closed</h3>
            <p className="text-sm text-muted-foreground">Deal won (converted to client) or lost (didn't proceed).</p>
          </div>
        </div>
      </section>
      <DocTip>Drag leads between columns to update their stage, and add notes to track conversations.</DocTip>
    </DocsLayout>
  );
}
