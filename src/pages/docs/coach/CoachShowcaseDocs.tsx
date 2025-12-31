import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Shield, CheckCircle, XCircle, Clock, Globe, Users, Image } from "lucide-react";

export default function CoachShowcaseDocs() {
  return (
    <DocsLayout
      title="Transformations & Showcase"
      description="Display client transformations on your profile to demonstrate your coaching results."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Transformations" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to showcase client transformations on their public 
            profile. Before/after photos are one of the most powerful ways to demonstrate your 
            coaching effectiveness to potential clients.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  Before/After Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload before and after transformation photos to showcase client progress.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Consent Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Request and track client consent for displaying their photos publicly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Public Display
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Approved transformations appear on your public profile for potential clients to see.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  External Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add transformations from clients you worked with outside the platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Potential clients want proof that you can deliver results. The showcase feature:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Builds trust with potential clients through visual proof of results</li>
            <li>Differentiates you from other coaches in the marketplace</li>
            <li>Ensures proper consent is obtained for all displayed photos</li>
            <li>Allows you to highlight your best work and specialties</li>
            <li>Creates a portfolio that grows with your coaching career</li>
          </ul>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Adding a Transformation</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Navigate to Showcase">
              Go to your coach dashboard and click on "Transformations" or "Showcase" in the sidebar.
            </DocStep>

            <DocStep stepNumber={2} title="Create New Entry">
              Click "Add Transformation" to start a new showcase entry.
            </DocStep>

            <DocStep stepNumber={3} title="Upload Photos">
              Upload the before photo (starting point) and after photo (current/end result). 
              Use the photo editor to crop and align images.
            </DocStep>

            <DocStep stepNumber={4} title="Add Details">
              Enter the client's first name (or alias), duration of transformation, and a brief 
              description of what you worked on together.
            </DocStep>

            <DocStep stepNumber={5} title="Request Consent">
              If this is a platform client, send a consent request. They'll receive a notification 
              to approve or decline. For external clients, mark as "External" with consent obtained.
            </DocStep>
          </div>
        </section>

        {/* Consent System */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Consent Management
          </h2>
          <p className="text-muted-foreground mb-4">
            Client consent is mandatory for displaying transformation photos. The platform handles 
            consent tracking to protect both you and your clients.
          </p>

          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending Consent
              </h3>
              <p className="text-sm text-muted-foreground">
                When you add a transformation for a platform client, a consent request is sent. 
                The transformation won't appear on your profile until approved.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Approved
              </h3>
              <p className="text-sm text-muted-foreground">
                Once a client approves, the transformation becomes visible on your public profile 
                and in search results.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Declined
              </h3>
              <p className="text-sm text-muted-foreground">
                If declined, the photos are never displayed publicly. You can delete the entry 
                or keep it private for your records.
              </p>
            </div>
          </div>

          <DocInfo className="mt-4">
            Consent types include "Photos only" (just the images) and "Full showcase" (photos plus 
            first name and stats). Clients choose their comfort level.
          </DocInfo>
        </section>

        {/* External Clients */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">External Client Transformations</h2>
          <p className="text-muted-foreground mb-4">
            You can add transformations from clients you've worked with outside of FitConnect:
          </p>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Mark as External">
              When adding a transformation, toggle "External Client" to indicate this person isn't 
              on the platform.
            </DocStep>

            <DocStep stepNumber={2} title="Confirm Consent Obtained">
              Check the box confirming you have obtained written consent from the client to display 
              their photos publicly.
            </DocStep>

            <DocStep stepNumber={3} title="Upload and Publish">
              Since consent is manually confirmed, the transformation can be published immediately 
              without waiting for in-app approval.
            </DocStep>
          </div>

          <DocWarning className="mt-4">
            You are responsible for ensuring you have proper consent for external client photos. 
            Keep records of consent in case of disputes.
          </DocWarning>
        </section>

        {/* Photo Guidelines */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Photo Guidelines
          </h2>
          <DocTip>
            Consistent lighting, angles, and poses between before/after photos make transformations 
            more credible and impactful.
          </DocTip>
          <div className="mt-4 space-y-3 text-muted-foreground">
            <p>For best results:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use similar lighting conditions for both photos</li>
              <li>Same pose and angle for accurate comparison</li>
              <li>Avoid heavy filters or editing beyond cropping</li>
              <li>Include similar clothing/coverage levels</li>
              <li>High resolution photos display better on all devices</li>
            </ul>
          </div>
        </section>

        {/* Suggested Photos */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Using Suggested Photos</h2>
          <p className="text-muted-foreground mb-4">
            If a client has shared progress photos with you through messages or check-ins, and they've 
            granted photo consent, you may see "Suggested Photos" when creating a showcase entry.
          </p>
          <div className="bg-card/50 border border-border/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Suggested photos come from your client's progress tracking. Click on a suggested photo 
              to use it as the before or after image. This saves time and ensures consistency with 
              photos they've already shared.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can a client revoke consent later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, clients can revoke consent at any time from their settings. If revoked, the 
                transformation will be removed from your public profile immediately.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How many transformations can I showcase?</h3>
              <p className="text-sm text-muted-foreground">
                There's no hard limit, but your profile displays the most recent approved transformations 
                prominently. Quality over quantity is recommended.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I edit a transformation after publishing?</h3>
              <p className="text-sm text-muted-foreground">
                You can edit the description and duration, but changing photos requires new consent 
                from the client.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What if a client leaves the platform?</h3>
              <p className="text-sm text-muted-foreground">
                Approved transformations remain on your profile even if the client leaves, as consent 
                was granted. They can contact support to request removal if needed.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Are transformations included in my public profile?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, approved transformations appear in a dedicated "Results" or "Transformations" 
                section on your public coach profile that potential clients can browse.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
