import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Calendar, Users, CreditCard, Palette, Settings, CheckCircle } from "lucide-react";

export default function GymGettingStarted() {
  return (
    <DocsLayout
      title="Getting Started with Gym Management"
      description="Complete the 8-step onboarding process to set up your gym, configure locations, memberships, and start accepting members."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Getting Started" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          When you first sign up for gym management, you'll be guided through our comprehensive 
          onboarding wizard. This ensures your gym is properly configured before you start 
          accepting members.
        </p>
        
        <DocInfo>
          You can save your progress at any step and return later. Your setup will be saved 
          automatically as you complete each section.
        </DocInfo>
      </section>

      {/* Onboarding Steps Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Onboarding Steps</h2>
        
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">1. Gym Basics</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Name, type, and description
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="pb-2">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">2. Locations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Addresses and hours
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="pb-2">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">3. Services</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Class types and sessions
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="pb-2">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">4. Team</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Staff and instructors
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">5. Memberships</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Plans and pricing
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">6. Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Stripe connection
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="pb-2">
              <Palette className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">7. Branding</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Logo and colours
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">8. Review</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Confirm and launch
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Step-by-Step Guide</h2>

        <DocStep stepNumber={1} title="Gym Basics">
          <p className="mb-4">Enter your gym's fundamental information:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Gym Name</strong> - Your business name as it will appear to members</li>
            <li><strong>Gym Type</strong> - Select from gym, martial arts school, yoga studio, CrossFit box, etc.</li>
            <li><strong>Description</strong> - A brief description of your facility and services</li>
            <li><strong>Contact Information</strong> - Email and phone number for member enquiries</li>
            <li><strong>Website</strong> - Your existing website URL (optional)</li>
          </ul>
          <DocTip>
            Choose a gym type that best matches your primary offering. This helps configure 
            default settings like grading systems for martial arts schools.
          </DocTip>
        </DocStep>

        <DocStep stepNumber={2} title="Locations">
          <p className="mb-4">Add your gym location(s) with details:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Address</strong> - Full street address for each location</li>
            <li><strong>Operating Hours</strong> - Set hours for each day of the week</li>
            <li><strong>Facilities</strong> - List available amenities (parking, showers, lockers)</li>
            <li><strong>Capacity</strong> - Maximum members for the location</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            You can add multiple locations if you run a multi-site business. Each location 
            can have its own schedule, staff assignments, and settings.
          </p>
          <DocInfo>
            You can always add more locations later from the Locations section of your dashboard.
          </DocInfo>
        </DocStep>

        <DocStep stepNumber={3} title="Services">
          <p className="mb-4">Define what classes and services you offer:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Class Types</strong> - Create categories like "Boxing", "Yoga", "HIIT"</li>
            <li><strong>Duration</strong> - Set default class lengths</li>
            <li><strong>Capacity</strong> - Maximum participants per class</li>
            <li><strong>Colour Coding</strong> - Assign colours for easy schedule viewing</li>
            <li><strong>Description</strong> - What members can expect from each class</li>
          </ul>
          <DocTip>
            Start with your main class types. You can add more specialized classes later as 
            your schedule develops.
          </DocTip>
        </DocStep>

        <DocStep stepNumber={4} title="Team">
          <p className="mb-4">Invite your staff and instructors:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Invite by Email</strong> - Send invitations to join your gym team</li>
            <li><strong>Assign Roles</strong> - Set appropriate permissions for each staff member</li>
            <li><strong>Link to Classes</strong> - Associate instructors with the classes they teach</li>
            <li><strong>Set Availability</strong> - Configure working hours for scheduling</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            Staff members will receive an email to create their account and join your gym.
          </p>
          <DocWarning>
            You can skip this step and add team members later, but having at least one 
            instructor helps when setting up your class schedule.
          </DocWarning>
        </DocStep>

        <DocStep stepNumber={5} title="Memberships">
          <p className="mb-4">Create your membership plans:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Recurring Memberships</strong> - Monthly or annual subscriptions with auto-billing</li>
            <li><strong>Class Packs</strong> - Buy 10/20/50 class credits at a time</li>
            <li><strong>Drop-In</strong> - Single class or day pass options</li>
            <li><strong>Trial Memberships</strong> - Free or discounted intro offers</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            For each plan, set the price, billing interval, included benefits, and any restrictions.
          </p>
          <DocTip>
            A good starter setup includes a monthly unlimited membership, a class pack option, 
            and a trial offer for new members.
          </DocTip>
        </DocStep>

        <DocStep stepNumber={6} title="Payments">
          <p className="mb-4">Connect your payment processing:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Stripe Connect</strong> - Link your Stripe account for card payments</li>
            <li><strong>Bank Account</strong> - Set up where payouts will be deposited</li>
            <li><strong>Tax Settings</strong> - Configure VAT if applicable</li>
            <li><strong>Currency</strong> - Set your billing currency</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            Click "Connect with Stripe" to either create a new Stripe account or link an existing one.
          </p>
          <DocWarning>
            Stripe verification is required before you can accept payments. This may take 
            a few days for new accounts.
          </DocWarning>
        </DocStep>

        <DocStep stepNumber={7} title="Branding">
          <p className="mb-4">Customise your gym's appearance:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>Logo</strong> - Upload your gym logo for member portal and communications</li>
            <li><strong>Primary Colour</strong> - Set your brand's main colour</li>
            <li><strong>Secondary Colour</strong> - Accent colour for buttons and highlights</li>
            <li><strong>Banner Image</strong> - Header image for your member portal</li>
          </ul>
          <DocInfo>
            Your branding will be applied to the member portal, check-in kiosk, and email 
            communications.
          </DocInfo>
        </DocStep>

        <DocStep stepNumber={8} title="Review & Launch">
          <p className="mb-4">Final review before launching:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li>Review all settings you've configured</li>
            <li>Check that your locations and hours are correct</li>
            <li>Verify your membership pricing</li>
            <li>Confirm Stripe is connected (if accepting online payments)</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            Once you click "Complete Setup", your gym dashboard will be fully activated 
            and you can start adding members.
          </p>
        </DocStep>
      </section>

      {/* Post-Onboarding */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">After Onboarding</h2>
        <p className="text-muted-foreground mb-4">
          Once you've completed onboarding, you'll have access to your full gym dashboard. 
          Here are the recommended next steps:
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Create your weekly class schedule</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Set up your contract templates for member agreements</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Configure automated emails for welcome messages and reminders</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Add your first members or share your signup link</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Set up your check-in kiosk or QR code system</span>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
