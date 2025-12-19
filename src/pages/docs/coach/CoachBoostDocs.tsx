import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Rocket, Users, Percent, TrendingUp } from "lucide-react";

export default function CoachBoostDocs() {
  return (
    <DocsLayout
      title="Boost Marketing"
      description="Get featured in search results and acquire new clients."
      breadcrumbs={[{ label: "For Coaches", href: "/docs/coach" }, { label: "Boost" }]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          What is Boost?
        </h2>
        <p className="text-muted-foreground mb-4">
          Boost is a pay-for-performance marketing tool. When enabled, your profile appears 
          at the top of search results. You only pay when you acquire a new client through Boost.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Percent className="h-5 w-5 text-green-500" />
          How It Works
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Enable Boost from your dashboard</li>
          <li>Your profile gets priority placement in search results</li>
          <li>When a new client books through Boost, you pay 30% of the first booking</li>
          <li>No upfront costs or monthly fees</li>
        </ul>
        <DocWarning>
          Boost fees apply only to the first booking from each new client acquired through the feature.
        </DocWarning>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Tracking Results
        </h2>
        <p className="text-muted-foreground">
          View your Boost analytics: clients acquired, fees paid, and ROI in the Boost dashboard.
        </p>
      </section>
      <DocTip>Boost works best when you have a complete profile with reviews and competitive pricing.</DocTip>
    </DocsLayout>
  );
}
