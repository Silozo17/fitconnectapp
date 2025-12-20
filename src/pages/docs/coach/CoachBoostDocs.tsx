import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Rocket, Users, Percent, TrendingUp, CreditCard, Clock } from "lucide-react";

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
          Boost is a paid marketing feature that puts your profile at the top of search results 
          for 30 days. Combined with a performance-based commission on new client acquisitions, 
          it helps you grow your client base with measurable ROI.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-500" />
          Pricing
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Activation Fee:</strong> £5 one-time payment for 30 days of priority visibility</li>
          <li><strong>First-Booking Commission:</strong> 30% of the first session booking from each new client</li>
          <li><strong>Minimum Fee:</strong> £9 (on bookings under £30)</li>
          <li><strong>Maximum Fee:</strong> £30 (on bookings over £100)</li>
          <li>No auto-renewal — you choose when to purchase again</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Percent className="h-5 w-5 text-blue-500" />
          How It Works
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Purchase Boost for £5 from your dashboard</li>
          <li>Your profile gets priority placement in search results for 30 days</li>
          <li>When a new client books their first session, you pay 30% commission</li>
          <li>All repeat bookings from that client are 100% yours — no more fees</li>
        </ol>
        <DocWarning>
          Boost fees apply only to the first booking from each new client acquired through the feature.
          After Boost expires, you'll need to purchase again to maintain priority visibility.
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Expiry & Renewal
        </h2>
        <p className="text-muted-foreground mb-4">
          Boost lasts exactly 30 days from your purchase date. There's no auto-renewal — 
          when your Boost expires, you'll return to normal search ranking. You can purchase 
          a new Boost at any time to continue appearing first.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Tracking Results
        </h2>
        <p className="text-muted-foreground">
          View your Boost analytics in the dashboard: days remaining, clients acquired, 
          fees paid, estimated lifetime value, and ROI from your Boost investment.
        </p>
      </section>

      <DocTip>
        Boost works best when you have a complete profile with reviews and competitive pricing. 
        The £5 activation fee is a small investment that can lead to long-term client relationships.
      </DocTip>
    </DocsLayout>
  );
}
