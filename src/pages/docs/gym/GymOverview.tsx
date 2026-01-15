import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  CreditCard, 
  Calendar, 
  QrCode,
  UserPlus,
  MapPin,
  Dumbbell,
  BarChart3,
  ArrowRight,
  Settings,
  Megaphone,
  ShoppingCart,
  FileText,
  Award,
  MessageSquare
} from "lucide-react";

const gymGuides = [
  {
    title: "Getting Started",
    description: "Complete onboarding to set up your gym with locations, memberships, and branding.",
    href: "/docs/gym/getting-started",
    icon: UserPlus,
  },
  {
    title: "Member Management",
    description: "Add members, manage profiles, track attendance, and handle family accounts.",
    href: "/docs/gym/members",
    icon: Users,
  },
  {
    title: "Memberships & Plans",
    description: "Create recurring subscriptions, class packs, drop-ins, and trial memberships.",
    href: "/docs/gym/memberships",
    icon: CreditCard,
  },
  {
    title: "Class Scheduling",
    description: "Set up class types, create recurring schedules, and assign instructors.",
    href: "/docs/gym/classes",
    icon: Calendar,
  },
  {
    title: "Check-In System",
    description: "QR code check-ins, kiosk mode, and attendance tracking.",
    href: "/docs/gym/checkins",
    icon: QrCode,
  },
  {
    title: "Staff Management",
    description: "Invite staff, set role permissions, schedule shifts, and track time.",
    href: "/docs/gym/staff",
    icon: Dumbbell,
  },
  {
    title: "Lead Management",
    description: "Capture leads, track pipeline stages, and convert prospects to members.",
    href: "/docs/gym/leads",
    icon: UserPlus,
  },
  {
    title: "Marketing & Automations",
    description: "Create campaigns, promotions, and automated member communications.",
    href: "/docs/gym/marketing",
    icon: Megaphone,
  },
  {
    title: "Point of Sale",
    description: "Sell products, manage inventory, and process in-person transactions.",
    href: "/docs/gym/pos",
    icon: ShoppingCart,
  },
  {
    title: "Payments & Billing",
    description: "Connect Stripe, process payments, manage invoices, and handle refunds.",
    href: "/docs/gym/payments",
    icon: CreditCard,
  },
  {
    title: "Contracts",
    description: "Create contract templates and manage member agreements.",
    href: "/docs/gym/contracts",
    icon: FileText,
  },
  {
    title: "Grading System",
    description: "Track belt ranks, create grading events, and record student progress.",
    href: "/docs/gym/grading",
    icon: Award,
  },
  {
    title: "Reports & Analytics",
    description: "View revenue, attendance, retention, and performance reports.",
    href: "/docs/gym/reports",
    icon: BarChart3,
  },
  {
    title: "Multi-Location",
    description: "Manage multiple gym locations from a single dashboard.",
    href: "/docs/gym/locations",
    icon: MapPin,
  },
  {
    title: "Member Portal",
    description: "What your members see and can do through their portal.",
    href: "/docs/gym/member-portal",
    icon: Users,
  },
  {
    title: "Settings",
    description: "Configure branding, notifications, permissions, and integrations.",
    href: "/docs/gym/settings",
    icon: Settings,
  },
];

export default function GymOverview() {
  return (
    <DocsLayout
      title="Gym Management Platform"
      description="Complete guide to running your gym, martial arts school, or fitness studio with FitConnect's comprehensive management platform."
      breadcrumbs={[{ label: "For Gym Owners" }]}
    >
      {/* Introduction */}
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          FitConnect's Gym Management platform provides everything you need to run a successful fitness 
          business. From member management and class scheduling to payments and marketing, our platform 
          streamlines your operations and helps you grow.
        </p>
        <p className="text-muted-foreground">
          Whether you run a small martial arts studio or a multi-location gym chain, our platform scales 
          with your business needs.
        </p>
      </section>

      {/* Key Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Member Management</h3>
            <p className="text-sm text-muted-foreground">Unlimited members with detailed profiles</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Class Scheduling</h3>
            <p className="text-sm text-muted-foreground">Drag-and-drop schedule builder</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
            <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Payment Processing</h3>
            <p className="text-sm text-muted-foreground">Stripe integration with auto-billing</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
            <QrCode className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Check-In System</h3>
            <p className="text-sm text-muted-foreground">QR codes and kiosk mode</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Analytics</h3>
            <p className="text-sm text-muted-foreground">Comprehensive business insights</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Multi-Location</h3>
            <p className="text-sm text-muted-foreground">Manage all locations centrally</p>
          </div>
        </div>
      </section>

      {/* Staff Roles */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Staff Roles</h2>
        <p className="text-muted-foreground mb-4">
          Our role-based permission system ensures staff have access to exactly what they need:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Owner</h3>
            <p className="text-sm text-muted-foreground">
              Full access to all features, billing, and settings. Can manage all locations and staff.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Area Manager</h3>
            <p className="text-sm text-muted-foreground">
              Manages multiple locations, can view financials and manage staff across assigned locations.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Manager</h3>
            <p className="text-sm text-muted-foreground">
              Full operational access for a single location including members, classes, and staff scheduling.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Coach / Instructor</h3>
            <p className="text-sm text-muted-foreground">
              Can view and manage their assigned classes, mark attendance, and view member details.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Front Desk</h3>
            <p className="text-sm text-muted-foreground">
              Check-in members, process sales, create new memberships, and handle day-to-day operations.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Marketing</h3>
            <p className="text-sm text-muted-foreground">
              Access to campaigns, leads, and promotional tools without member or financial data.
            </p>
          </div>
        </div>
      </section>

      {/* Guide Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Browse Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {gymGuides.map((guide) => (
            <Link key={guide.href} to={guide.href} className="no-underline">
              <Card className="h-full hover:border-primary/50 transition-colors bg-card">
                <CardHeader className="pb-2">
                  <guide.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">{guide.description}</CardDescription>
                  <span className="text-primary text-sm font-medium flex items-center gap-1">
                    Read guide <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Start Checklist</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">1</div>
            <span>Complete the onboarding wizard to set up your gym basics</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">2</div>
            <span>Add your first location with operating hours</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">3</div>
            <span>Create membership plans and pricing</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">4</div>
            <span>Set up class types and your weekly schedule</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">5</div>
            <span>Connect Stripe to start accepting payments</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">6</div>
            <span>Invite your staff and configure permissions</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">7</div>
            <span>Add your first members or enable self-signup</span>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
