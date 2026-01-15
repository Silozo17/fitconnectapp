import { useState } from "react";
import { 
  Users, CreditCard, Calendar, QrCode, UserCog, Target, 
  Mail, ShoppingBag, BarChart3, Building2, Check, ArrowRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Feature {
  id: string;
  icon: React.ElementType;
  title: string;
  shortTitle: string;
  description: string;
  benefits: string[];
  highlight?: string;
}

const features: Feature[] = [
  {
    id: "members",
    icon: Users,
    title: "Member Management",
    shortTitle: "Members",
    description: "Complete member profiles with contact details, membership history, attendance records, and custom notes. Never lose track of a member again.",
    benefits: [
      "Unlimited member profiles",
      "Family & linked accounts",
      "Custom fields & tags",
      "Document storage (waivers, contracts)",
      "Member timeline & activity log",
      "Import from CSV or other software",
    ],
    highlight: "Manage unlimited members",
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Memberships & Billing",
    shortTitle: "Billing",
    description: "Automated recurring payments, flexible membership types, and complete financial visibility. Get paid on time, every time.",
    benefits: [
      "Recurring & one-off payments",
      "Direct debit & card payments",
      "Flexible membership plans",
      "Proration & plan changes",
      "Failed payment recovery",
      "Automated invoicing & receipts",
    ],
    highlight: "Automated payment collection",
  },
  {
    id: "classes",
    icon: Calendar,
    title: "Class Scheduling",
    shortTitle: "Classes",
    description: "Intuitive drag-and-drop scheduling for classes, courses, and 1-on-1 sessions. Members book online 24/7.",
    benefits: [
      "Drag-and-drop calendar",
      "Recurring class templates",
      "Online booking for members",
      "Waitlist management",
      "Instructor assignment",
      "Capacity limits & booking windows",
    ],
    highlight: "24/7 online booking",
  },
  {
    id: "checkin",
    icon: QrCode,
    title: "Check-In System",
    shortTitle: "Check-In",
    description: "QR code scanning, kiosk mode, and real-time attendance tracking. Know who's in your gym at any moment.",
    benefits: [
      "QR code member cards",
      "Tablet kiosk mode",
      "Real-time attendance",
      "Access control integration",
      "Check-in notifications",
      "Attendance reports",
    ],
    highlight: "Real-time attendance tracking",
  },
  {
    id: "staff",
    icon: UserCog,
    title: "Staff Management",
    shortTitle: "Staff",
    description: "Role-based permissions, shift scheduling, and activity tracking. Empower your team with the right access.",
    benefits: [
      "Unlimited staff accounts",
      "Role-based permissions",
      "Staff activity logs",
      "Instructor scheduling",
      "Commission tracking",
      "Mobile staff app",
    ],
    highlight: "Unlimited staff accounts",
  },
  {
    id: "leads",
    icon: Target,
    title: "Lead Management",
    shortTitle: "Leads",
    description: "Capture leads from your website, track follow-ups, and convert prospects into members with an easy-to-use pipeline.",
    benefits: [
      "Lead capture forms",
      "Sales pipeline view",
      "Follow-up reminders",
      "Trial membership tracking",
      "Conversion analytics",
      "Automated nurture sequences",
    ],
    highlight: "Convert more prospects",
  },
  {
    id: "marketing",
    icon: Mail,
    title: "Marketing Automation",
    shortTitle: "Marketing",
    description: "Send targeted email and SMS campaigns, automate member communications, and keep your community engaged.",
    benefits: [
      "Email & SMS campaigns",
      "Automated welcome sequences",
      "Birthday & milestone messages",
      "Segment by membership type",
      "At-risk member alerts",
      "Referral tracking",
    ],
    highlight: "Automated communications",
  },
  {
    id: "pos",
    icon: ShoppingBag,
    title: "Point of Sale",
    shortTitle: "POS",
    description: "Sell supplements, merchandise, and add-ons directly from your dashboard. Track inventory and sales in one place.",
    benefits: [
      "Product catalogue",
      "Quick sale mode",
      "Inventory tracking",
      "Member account charges",
      "Sales reporting",
      "Barcode scanning",
    ],
    highlight: "Retail & merchandise sales",
  },
  {
    id: "reports",
    icon: BarChart3,
    title: "Reports & Analytics",
    shortTitle: "Reports",
    description: "Real-time dashboards showing revenue, attendance, retention, and growth metrics. Make data-driven decisions.",
    benefits: [
      "Revenue dashboards",
      "Attendance trends",
      "Member retention rates",
      "Class utilisation",
      "Financial reports",
      "Export to CSV/Excel",
    ],
    highlight: "Data-driven insights",
  },
  {
    id: "multisite",
    icon: Building2,
    title: "Multi-Location",
    shortTitle: "Multi-Site",
    description: "Manage multiple gyms from one dashboard. Centralised reporting with location-specific controls.",
    benefits: [
      "Centralised dashboard",
      "Per-location staff access",
      "Cross-location memberships",
      "Consolidated reporting",
      "Location-specific pricing",
      "Easy location switching",
    ],
    highlight: "+£25/month per additional location",
  },
];

export function FeatureTabs() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <div className="space-y-8">
      {/* Feature tabs - scrollable on mobile */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                activeFeature.id === feature.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <feature.icon className="w-4 h-4" />
              {feature.shortTitle}
            </button>
          ))}
        </div>
      </div>

      {/* Active feature content */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Description */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <activeFeature.icon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold">{activeFeature.title}</h3>
              {activeFeature.highlight && (
                <span className="text-sm text-primary font-medium">{activeFeature.highlight}</span>
              )}
            </div>
          </div>
          
          <p className="text-muted-foreground">{activeFeature.description}</p>
          
          <Button variant="outline" asChild>
            <Link to="/gym-register">
              Try {activeFeature.shortTitle} Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Benefits grid */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h4 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wide">
            What's Included
          </h4>
          <ul className="grid grid-cols-1 gap-3">
            {activeFeature.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Compact grid for quick feature overview
export function FeatureGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {features.map((feature) => (
        <div 
          key={feature.id}
          className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <feature.icon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium">{feature.shortTitle}</p>
        </div>
      ))}
    </div>
  );
}
