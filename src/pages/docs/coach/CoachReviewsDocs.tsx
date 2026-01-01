import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";
import { Star, MessageSquare, TrendingUp } from "lucide-react";

export default function CoachReviewsDocs() {
  return (
    <DocsLayout
      title="Manage Client Reviews | FitConnect Coach Guide"
      description="View, respond to and leverage reviews to grow your coaching business and visibility."
      breadcrumbs={[{ label: "Coach Guide", href: "/docs/coach" }, { label: "Reviews" }]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Your Reviews
        </h2>
        <p className="text-muted-foreground mb-4">
          Clients can leave reviews after completing sessions. Reviews appear on your public 
          profile and influence your visibility in search results.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Responding to Reviews
        </h2>
        <p className="text-muted-foreground">
          You can respond publicly to any review. Professional responses to both positive 
          and negative feedback builds trust with potential clients.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Impact on Visibility
        </h2>
        <p className="text-muted-foreground">
          Coaches with more positive reviews rank higher in search results. Encourage 
          satisfied clients to leave reviews after their sessions.
        </p>
      </section>
      <DocTip>Respond to every review within 48 hours to show you're engaged and professional.</DocTip>
    </DocsLayout>
  );
}
