import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, Clock, Video, MapPin, Bell, Settings } from "lucide-react";

export default function CoachGroupClassesDocs() {
  return (
    <DocsLayout
      title="Group Classes"
      description="Set up and manage group training sessions to expand your reach and income."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Group Classes" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to offer group training sessions. Group classes 
            allow you to train multiple clients simultaneously, increasing your earning 
            potential while building community.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Class Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create one-off or recurring group sessions with customisable capacity limits.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Participant Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track who's signed up, manage waitlists, and send group communications.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Group Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set per-person pricing, offer early bird rates, or bundle classes into packages.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  Online & In-Person
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Host classes online via Zoom/Google Meet or in-person at specified locations.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Group training offers benefits for both coaches and clients:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Earn more per hour by training multiple clients</li>
            <li>Offer more affordable options to price-sensitive clients</li>
            <li>Build community and accountability among clients</li>
            <li>Create energy and motivation through group dynamics</li>
            <li>Diversify your service offerings</li>
          </ul>
        </section>

        {/* Creating a Class */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Creating a Group Class</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Navigate to Schedule">
              Go to your Schedule page and click "Create Class" or "Add Group Session".
            </DocStep>

            <DocStep stepNumber={2} title="Set Class Details">
              Enter the class name, description, duration, and choose the date/time. 
              For recurring classes, set the repeat pattern (weekly, bi-weekly, etc.).
            </DocStep>

            <DocStep stepNumber={3} title="Set Capacity">
              Define the minimum and maximum number of participants. The class only runs 
              if minimum is met.
            </DocStep>

            <DocStep stepNumber={4} title="Choose Format">
              Select online (with video call link) or in-person (with location details).
            </DocStep>

            <DocStep stepNumber={5} title="Set Pricing">
              Set the per-person price. Optionally create early bird rates or multi-class discounts.
            </DocStep>

            <DocStep stepNumber={6} title="Publish">
              Publish the class to make it visible to your clients and on your public profile.
            </DocStep>
          </div>
        </section>

        {/* Class Types */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Class Types</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                One-Off Classes
              </h3>
              <p className="text-sm text-muted-foreground">
                Single sessions for special events, workshops, or try-out classes. 
                Great for introducing new clients to group training.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recurring Classes
              </h3>
              <p className="text-sm text-muted-foreground">
                Regular weekly or bi-weekly sessions. Clients can book individual sessions 
                or commit to the full series.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                Online Classes
              </h3>
              <p className="text-sm text-muted-foreground">
                Virtual sessions via integrated video platforms. Can scale to larger 
                groups without physical space constraints.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                In-Person Classes
              </h3>
              <p className="text-sm text-muted-foreground">
                Sessions at a gym, park, or other location. Include address and 
                any special instructions for participants.
              </p>
            </div>
          </div>
        </section>

        {/* Managing Participants */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Managing Participants</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Bookings
              </h3>
              <p className="text-sm text-muted-foreground">
                View who has booked each class. Send reminders, share class details, 
                or message all participants at once.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Waitlist
              </h3>
              <p className="text-sm text-muted-foreground">
                When a class is full, clients can join the waitlist. They're automatically 
                notified if a spot opens up.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Reminders
              </h3>
              <p className="text-sm text-muted-foreground">
                Automatic reminders are sent 24 hours and 1 hour before the class. 
                Customise reminder timing in settings.
              </p>
            </div>
          </div>

          <DocTip className="mt-4">
            Send a quick message to participants before class with any specific prep 
            (equipment needed, warm-up to do, etc.).
          </DocTip>
        </section>

        {/* Pricing Strategies */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Pricing Strategies
          </h2>
          <div className="space-y-3">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Per-Session Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Simple pay-per-class model. Best for one-off classes or clients trying 
                group training for the first time.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Class Packages</h3>
              <p className="text-sm text-muted-foreground">
                Sell bundles of class credits at a discount (e.g., 10 classes for the price of 8). 
                Encourages commitment.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Early Bird Rates</h3>
              <p className="text-sm text-muted-foreground">
                Offer discounted rates for bookings made X days in advance. Helps with 
                planning and ensures minimum attendance.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Subscriber Discount</h3>
              <p className="text-sm text-muted-foreground">
                Existing subscription clients can get reduced rates or included group 
                classes as part of their plan.
              </p>
            </div>
          </div>
        </section>

        {/* Cancellation Policies */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Cancellation Policies</h2>
          <p className="text-muted-foreground mb-4">
            Set clear cancellation rules for group classes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Free cancellation:</strong> Allow cancellations up to X hours before without penalty</li>
            <li><strong>Late cancellation:</strong> Partial refund or credit for late cancellations</li>
            <li><strong>No-show:</strong> Define what happens if a participant doesn't show up</li>
            <li><strong>Minimum attendance:</strong> Class cancellation if minimum participants not met</li>
          </ul>

          <DocWarning className="mt-4">
            Always communicate your cancellation policy clearly. It's displayed on the 
            booking page so clients know what to expect.
          </DocWarning>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can non-clients book group classes?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, if you make the class visible on your public profile. It's a great 
                way to attract new clients.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What happens if minimum attendance isn't met?</h3>
              <p className="text-sm text-muted-foreground">
                You can choose to run the class anyway, cancel (with full refunds), or 
                reschedule. The system notifies all participants.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I run both 1-1 and group sessions?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. Many coaches offer a mix of private sessions and group classes 
                to cater to different client needs and budgets.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How do I handle different fitness levels?</h3>
              <p className="text-sm text-muted-foreground">
                Structure your class with scalable exercises. Offer modifications for 
                beginners and progressions for advanced participants.
              </p>
            </div>
          </div>
        </section>

        <DocInfo>
          Group classes can significantly increase your income while building a 
          supportive community around your coaching brand.
        </DocInfo>
      </div>
    </DocsLayout>
  );
}