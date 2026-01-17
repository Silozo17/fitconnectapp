import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BookOpen, 
  User, 
  Dumbbell, 
  Shield,
  ChevronRight,
  ChevronDown,
  Home,
  UserPlus,
  Search,
  Calendar,
  ClipboardList,
  TrendingUp,
  Trophy,
  Settings,
  CreditCard,
  Users,
  MessageSquare,
  FileCheck,
  BarChart3,
  Flame,
  ShoppingCart,
  Target,
  Calculator,
  Library,
  Link2,
  Kanban,
  Package,
  Rocket,
  Utensils,
  Sparkles,
  Star,
  LayoutDashboard,
  FileText,
  Plug,
  Brain,
  AlertTriangle,
  Activity,
  LineChart,
  UsersRound,
  Building2,
  QrCode,
  Award,
  MapPin,
  Globe
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavChild {
  title: string;
  href: string;
  icon?: React.ElementType;
}

interface NavSection {
  sectionTitle: string;
  children: NavChild[];
}

interface NavItem {
  title: string;
  href: string;
  icon?: React.ElementType;
  sections?: NavSection[];
  children?: NavChild[]; // For non-sectioned items like Integrations
  adminOnly?: boolean;
}

// Categorized navigation structure
const navItems: NavItem[] = [
  {
    title: "Getting Started",
    href: "/docs/getting-started",
    icon: BookOpen,
  },
  {
    title: "For Clients",
    href: "/docs/client",
    icon: User,
    sections: [
      {
        sectionTitle: "Getting Started",
        children: [
          { title: "Overview", href: "/docs/client", icon: Home },
          { title: "Creating Your Profile", href: "/docs/client/profile", icon: UserPlus },
        ]
      },
      {
        sectionTitle: "Finding & Booking",
        children: [
          { title: "Finding Coaches", href: "/docs/client/coaches", icon: Search },
          { title: "Booking Sessions", href: "/docs/client/sessions", icon: Calendar },
          { title: "Messages", href: "/docs/client/messages", icon: MessageSquare },
          { title: "Favourites", href: "/docs/client/favourites", icon: Star },
        ]
      },
      {
        sectionTitle: "Plans & Nutrition",
        children: [
          { title: "Workout & Nutrition Plans", href: "/docs/client/plans", icon: ClipboardList },
          { title: "Food Diary", href: "/docs/client/food-diary", icon: Utensils },
          { title: "Shopping Lists", href: "/docs/client/grocery", icon: ShoppingCart },
        ]
      },
      {
        sectionTitle: "Progress & Health",
        children: [
          { title: "Training Logs", href: "/docs/client/training-logs", icon: Dumbbell },
          { title: "Tracking Progress", href: "/docs/client/progress", icon: TrendingUp },
          { title: "Habits & Streaks", href: "/docs/client/habits", icon: Flame },
          { title: "Readiness Score", href: "/docs/client/readiness", icon: Target },
          { title: "Wearable Trends", href: "/docs/client/trends", icon: TrendingUp },
          { title: "Micro Wins", href: "/docs/client/micro-wins", icon: Trophy },
          { title: "Goal Suggestions", href: "/docs/client/goal-suggestions", icon: Sparkles },
        ]
      },
      {
        sectionTitle: "Achievements & Social",
        children: [
          { title: "Challenges", href: "/docs/client/challenges", icon: Target },
          { title: "Achievements", href: "/docs/client/achievements", icon: Trophy },
          { title: "Leaderboards", href: "/docs/client/leaderboards", icon: BarChart3 },
          { title: "Connections", href: "/docs/client/connections", icon: Link2 },
        ]
      },
      {
        sectionTitle: "Tools & Library",
        children: [
          { title: "Fitness Tools", href: "/docs/client/tools", icon: Calculator },
          { title: "Marketplace", href: "/docs/client/marketplace", icon: Package },
          { title: "Digital Library", href: "/docs/client/library", icon: Library },
        ]
      },
      {
        sectionTitle: "Settings & Privacy",
        children: [
          { title: "Data Sharing", href: "/docs/client/data-sharing", icon: Shield },
          { title: "Account Security", href: "/docs/client/security", icon: Shield },
          { title: "Wearables", href: "/docs/client/wearables", icon: Settings },
          { title: "Settings", href: "/docs/client/settings", icon: Settings },
          { title: "Receipts", href: "/docs/client/receipts", icon: CreditCard },
          { title: "Notifications", href: "/docs/client/notifications", icon: Settings },
        ]
      },
      {
        sectionTitle: "Additional Features",
        children: [
          { title: "My Gyms", href: "/docs/client/my-gyms", icon: Building2 },
          { title: "Health History", href: "/docs/client/health-history", icon: Activity },
          { title: "Discipline Setup", href: "/docs/client/discipline-setup", icon: Target },
        ]
      },
    ],
  },
  {
    title: "For Coaches",
    href: "/docs/coach",
    icon: Dumbbell,
    sections: [
      {
        sectionTitle: "Getting Started",
        children: [
          { title: "Overview", href: "/docs/coach", icon: Home },
          { title: "Getting Started", href: "/docs/coach/onboarding", icon: BookOpen },
          { title: "Profile Setup", href: "/docs/coach/profile", icon: UserPlus },
          { title: "Verification", href: "/docs/coach/verification", icon: FileCheck },
        ]
      },
      {
        sectionTitle: "Client Management",
        children: [
          { title: "Managing Clients", href: "/docs/coach/clients", icon: Users },
          { title: "Client Comparison", href: "/docs/coach/comparison", icon: BarChart3 },
          { title: "Client Wearables", href: "/docs/coach/wearables", icon: Settings },
          { title: "Client Risk Detection", href: "/docs/coach/client-risk", icon: AlertTriangle },
          { title: "Plateau Detection", href: "/docs/coach/plateau-detection", icon: Activity },
          { title: "Goal Adherence", href: "/docs/coach/goal-adherence", icon: Target },
        ]
      },
      {
        sectionTitle: "Sales & Pipeline",
        children: [
          { title: "Sales Pipeline", href: "/docs/coach/pipeline", icon: Kanban },
          { title: "Messaging & Templates", href: "/docs/coach/messaging", icon: MessageSquare },
          { title: "Check-in Suggestions", href: "/docs/coach/checkin-suggestions", icon: MessageSquare },
        ]
      },
      {
        sectionTitle: "Plans & Nutrition",
        children: [
          { title: "Building Plans", href: "/docs/coach/plans", icon: ClipboardList },
          { title: "Nutrition Builder", href: "/docs/coach/nutrition", icon: Utensils },
          { title: "Digital Products", href: "/docs/coach/products", icon: Package },
        ]
      },
      {
        sectionTitle: "Scheduling & Payments",
        children: [
          { title: "Schedule & Sessions", href: "/docs/coach/schedule", icon: Calendar },
          { title: "Packages & Pricing", href: "/docs/coach/packages", icon: CreditCard },
          { title: "Package Analytics", href: "/docs/coach/package-analytics", icon: BarChart3 },
          { title: "Group Classes", href: "/docs/coach/group-classes", icon: UsersRound },
          { title: "Financial Management", href: "/docs/coach/financial", icon: CreditCard },
          { title: "Earnings & Stripe", href: "/docs/coach/earnings", icon: BarChart3 },
        ]
      },
      {
        sectionTitle: "Analytics & Insights",
        children: [
          { title: "Engagement Scoring", href: "/docs/coach/engagement-scoring", icon: Activity },
          { title: "Client LTV", href: "/docs/coach/client-ltv", icon: CreditCard },
          { title: "Upsell Insights", href: "/docs/coach/upsell-insights", icon: TrendingUp },
          { title: "Revenue Forecasting", href: "/docs/coach/revenue-forecast", icon: LineChart },
        ]
      },
      {
        sectionTitle: "AI & Automation",
        children: [
          { title: "AI Tools", href: "/docs/coach/ai", icon: Sparkles },
          { title: "AI Recommendations", href: "/docs/coach/ai-recommendations", icon: Brain },
          { title: "Automations", href: "/docs/coach/automations", icon: Settings },
        ]
      },
      {
        sectionTitle: "Marketing & Showcase",
        children: [
          { title: "Boost Marketing", href: "/docs/coach/boost", icon: Rocket },
          { title: "Outcome Showcase", href: "/docs/coach/showcase", icon: Trophy },
          { title: "Case Studies", href: "/docs/coach/case-studies", icon: FileText },
          { title: "Managing Reviews", href: "/docs/coach/reviews", icon: Star },
        ]
      },
      {
        sectionTitle: "Settings & Integrations",
        children: [
          { title: "Integrations", href: "/docs/coach/integrations", icon: Plug },
          { title: "Connections", href: "/docs/coach/connections", icon: Link2 },
          { title: "Settings", href: "/docs/coach/settings", icon: Settings },
          { title: "Achievements", href: "/docs/coach/achievements", icon: Trophy },
        ]
      },
    ],
  },
  {
    title: "For Gyms",
    href: "/docs/gym",
    icon: Building2,
    sections: [
      {
        sectionTitle: "Getting Started",
        children: [
          { title: "Overview", href: "/docs/gym", icon: Home },
          { title: "Getting Started", href: "/docs/gym/getting-started", icon: BookOpen },
        ]
      },
      {
        sectionTitle: "Member Management",
        children: [
          { title: "Member Management", href: "/docs/gym/members", icon: Users },
          { title: "Memberships & Plans", href: "/docs/gym/memberships", icon: CreditCard },
          { title: "Lead Management", href: "/docs/gym/leads", icon: Kanban },
          { title: "Family Accounts", href: "/docs/gym/family-accounts", icon: Users },
        ]
      },
      {
        sectionTitle: "Classes & Check-Ins",
        children: [
          { title: "Class Scheduling", href: "/docs/gym/classes", icon: Calendar },
          { title: "Recurring Schedules", href: "/docs/gym/recurring-schedules", icon: Calendar },
          { title: "Check-In System", href: "/docs/gym/checkins", icon: QrCode },
          { title: "Check-In Management", href: "/docs/gym/check-in-management", icon: QrCode },
          { title: "Grading System", href: "/docs/gym/grading", icon: Award },
        ]
      },
      {
        sectionTitle: "Staff & Operations",
        children: [
          { title: "Staff Management", href: "/docs/gym/staff", icon: Users },
          { title: "Multi-Location", href: "/docs/gym/locations", icon: MapPin },
          { title: "Advanced Multi-Location", href: "/docs/gym/multi-location-advanced", icon: MapPin },
          { title: "Activity Log", href: "/docs/gym/activity-log", icon: FileText },
        ]
      },
      {
        sectionTitle: "Payments & Sales",
        children: [
          { title: "Payments & Billing", href: "/docs/gym/payments", icon: CreditCard },
          { title: "Point of Sale", href: "/docs/gym/pos", icon: ShoppingCart },
          { title: "Products & Inventory", href: "/docs/gym/products", icon: Package },
          { title: "Contracts", href: "/docs/gym/contracts", icon: FileText },
          { title: "Refunds", href: "/docs/gym/refunds", icon: CreditCard },
          { title: "Invoicing", href: "/docs/gym/invoicing", icon: FileText },
          { title: "Credits System", href: "/docs/gym/credits-advanced", icon: CreditCard },
        ]
      },
      {
        sectionTitle: "Marketing & Communications",
        children: [
          { title: "Marketing & Automations", href: "/docs/gym/marketing", icon: Rocket },
          { title: "Advanced Automations", href: "/docs/gym/automations-advanced", icon: Settings },
          { title: "Messaging", href: "/docs/gym/messaging", icon: MessageSquare },
          { title: "Promotions & Discounts", href: "/docs/gym/promotions", icon: Rocket },
          { title: "Referral Programs", href: "/docs/gym/referrals", icon: Link2 },
        ]
      },
      {
        sectionTitle: "Reports & Analytics",
        children: [
          { title: "Reports & Analytics", href: "/docs/gym/reports", icon: BarChart3 },
          { title: "Analytics Dashboard", href: "/docs/gym/analytics-dashboard", icon: LayoutDashboard },
          { title: "Advanced Reporting", href: "/docs/gym/reporting-advanced", icon: BarChart3 },
        ]
      },
      {
        sectionTitle: "Portal & Settings",
        children: [
          { title: "Member Portal", href: "/docs/gym/member-portal", icon: Globe },
          { title: "Website Builder", href: "/docs/gym/website-builder", icon: Globe },
          { title: "Embed Widgets", href: "/docs/gym/embed-widgets", icon: Plug },
          { title: "Settings", href: "/docs/gym/settings", icon: Settings },
        ]
      },
    ],
  },
  {
    title: "Integrations",
    href: "/docs/integrations/wearables",
    icon: Plug,
    children: [
      { title: "Wearables Overview", href: "/docs/integrations/wearables", icon: Settings },
      { title: "Apple Health", href: "/docs/integrations/apple-health", icon: Settings },
      { title: "Health Connect", href: "/docs/integrations/health-connect", icon: Settings },
      { title: "Garmin", href: "/docs/integrations/garmin", icon: Settings },
      { title: "Fitbit", href: "/docs/integrations/fitbit", icon: Settings },
      { title: "Zoom", href: "/docs/integrations/zoom", icon: Plug },
      { title: "Google Meet", href: "/docs/integrations/google-meet", icon: Plug },
      { title: "Google Calendar", href: "/docs/integrations/google-calendar", icon: Calendar },
      { title: "Apple Calendar", href: "/docs/integrations/apple-calendar", icon: Calendar },
    ],
  },
  {
    title: "For Administrators",
    href: "/docs/admin",
    icon: Shield,
    adminOnly: true,
    children: [
      { title: "Overview", href: "/docs/admin", icon: Home },
      { title: "Dashboard", href: "/docs/admin/dashboard", icon: LayoutDashboard },
      { title: "User Management", href: "/docs/admin/users", icon: Users },
      { title: "Coach Management", href: "/docs/admin/coaches", icon: Dumbbell },
      { title: "Gym Management", href: "/docs/admin/gyms", icon: Building2 },
      { title: "Team Management", href: "/docs/admin/team", icon: Shield },
      { title: "Revenue", href: "/docs/admin/revenue", icon: CreditCard },
      { title: "Analytics", href: "/docs/admin/analytics", icon: BarChart3 },
      { title: "Challenges", href: "/docs/admin/challenges", icon: Trophy },
      { title: "Blog", href: "/docs/admin/blog", icon: FileText },
      { title: "Boosts", href: "/docs/admin/boosts", icon: Rocket },
      { title: "Review Moderation", href: "/docs/admin/reviews", icon: Star },
      { title: "User Feedback", href: "/docs/admin/feedback", icon: MessageSquare },
      { title: "Integrations", href: "/docs/admin/integrations", icon: Plug },
      { title: "Audit Log", href: "/docs/admin/audit", icon: FileCheck },
      { title: "Debug Console", href: "/docs/admin/debug", icon: Settings },
    ],
  },
];

interface DocNavProps {
  onNavigate?: () => void;
}

export function DocNav({ onNavigate }: DocNavProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { role } = useAuth();

  const isAdmin = role === "admin" || role === "manager" || role === "staff";

  const isActive = (href: string) => currentPath === href;
  const isParentActive = (item: NavItem) => 
    currentPath.startsWith(item.href) || 
    item.sections?.some(section => section.children.some(child => currentPath === child.href)) ||
    item.children?.some(child => currentPath === child.href);

  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Auto-expand sections that contain the active route
    const initial: Record<string, boolean> = {};
    navItems.forEach(item => {
      if (item.sections) {
        item.sections.forEach(section => {
          const key = `${item.href}-${section.sectionTitle}`;
          const hasActive = section.children.some(child => currentPath === child.href);
          initial[key] = hasActive;
        });
      }
    });
    return initial;
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClick = () => {
    onNavigate?.();
  };

  // Filter out admin-only items if user is not admin
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="w-full lg:w-64 flex-shrink-0 border-r border-border bg-card/50 p-4 pb-8">
      <div className="mb-6">
        <Link to="/docs" className="flex items-center gap-2 text-primary font-semibold" onClick={handleClick}>
          <BookOpen className="h-5 w-5" />
          <span>Help Center</span>
        </Link>
      </div>

      <div className="space-y-1">
        {visibleNavItems.map((item) => (
          <div key={item.href}>
            <Link
              to={item.href}
              onClick={handleClick}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive(item.href) || (isParentActive(item) && !item.sections && !item.children)
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.title}</span>
              {(item.sections || item.children) && (
                <ChevronRight className={cn(
                  "h-4 w-4 ml-auto transition-transform",
                  isParentActive(item) && "rotate-90"
                )} />
              )}
            </Link>

            {/* Sectioned navigation (Client & Coach) */}
            {item.sections && isParentActive(item) && (
              <div className="ml-4 mt-2 space-y-2 border-l border-border pl-3">
                {item.sections.map((section) => {
                  const sectionKey = `${item.href}-${section.sectionTitle}`;
                  const isSectionExpanded = expandedSections[sectionKey] ?? section.children.some(c => isActive(c.href));
                  const hasActiveChild = section.children.some(c => isActive(c.href));

                  return (
                    <Collapsible
                      key={sectionKey}
                      open={isSectionExpanded}
                      onOpenChange={() => toggleSection(sectionKey)}
                    >
                      <CollapsibleTrigger className={cn(
                        "flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium uppercase tracking-wide rounded transition-colors",
                        hasActiveChild 
                          ? "text-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}>
                        <span className="text-left">{section.sectionTitle}</span>
                        {isSectionExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-0.5 mt-1">
                        {section.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            onClick={handleClick}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                              isActive(child.href)
                                ? "bg-primary/20 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {child.icon && <child.icon className="h-3.5 w-3.5" />}
                            <span>{child.title}</span>
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}

            {/* Flat navigation (Integrations, Admin) */}
            {item.children && !item.sections && isParentActive(item) && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    to={child.href}
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                      isActive(child.href)
                        ? "bg-primary/20 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {child.icon && <child.icon className="h-3.5 w-3.5" />}
                    <span>{child.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
