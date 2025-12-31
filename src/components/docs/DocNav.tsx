import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BookOpen, 
  User, 
  Dumbbell, 
  Shield,
  ChevronRight,
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
  Plug
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ElementType;
  children?: NavItem[];
  adminOnly?: boolean;
}

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
    children: [
      { title: "Overview", href: "/docs/client", icon: Home },
      { title: "Creating Your Profile", href: "/docs/client/profile", icon: UserPlus },
      { title: "Finding Coaches", href: "/docs/client/coaches", icon: Search },
      { title: "Booking Sessions", href: "/docs/client/sessions", icon: Calendar },
      { title: "Workout & Nutrition Plans", href: "/docs/client/plans", icon: ClipboardList },
      { title: "Food Diary", href: "/docs/client/food-diary", icon: Utensils },
      { title: "Training Logs", href: "/docs/client/training-logs", icon: Dumbbell },
      { title: "Tracking Progress", href: "/docs/client/progress", icon: TrendingUp },
      { title: "Habits & Streaks", href: "/docs/client/habits", icon: Flame },
      { title: "Shopping Lists", href: "/docs/client/grocery", icon: ShoppingCart },
      { title: "Challenges", href: "/docs/client/challenges", icon: Target },
      { title: "Fitness Tools", href: "/docs/client/tools", icon: Calculator },
      { title: "Marketplace", href: "/docs/client/marketplace", icon: Package },
      { title: "Digital Library", href: "/docs/client/library", icon: Library },
      { title: "Receipts", href: "/docs/client/receipts", icon: CreditCard },
      { title: "Connections", href: "/docs/client/connections", icon: Link2 },
      { title: "Achievements & Leaderboards", href: "/docs/client/achievements", icon: Trophy },
      { title: "Data Privacy", href: "/docs/client/data-privacy", icon: Shield },
      { title: "Settings & Integrations", href: "/docs/client/settings", icon: Settings },
    ],
  },
  {
    title: "For Coaches",
    href: "/docs/coach",
    icon: Dumbbell,
    children: [
      { title: "Overview", href: "/docs/coach", icon: Home },
      { title: "Getting Started", href: "/docs/coach/onboarding", icon: BookOpen },
      { title: "Profile Setup", href: "/docs/coach/profile", icon: UserPlus },
      { title: "Managing Clients", href: "/docs/coach/clients", icon: Users },
      { title: "Sales Pipeline", href: "/docs/coach/pipeline", icon: Kanban },
      { title: "Messaging & Templates", href: "/docs/coach/messaging", icon: MessageSquare },
      { title: "Building Plans", href: "/docs/coach/plans", icon: ClipboardList },
      { title: "Nutrition Builder", href: "/docs/coach/nutrition", icon: Utensils },
      { title: "Digital Products", href: "/docs/coach/products", icon: Package },
      { title: "Schedule & Sessions", href: "/docs/coach/schedule", icon: Calendar },
      { title: "Packages & Pricing", href: "/docs/coach/packages", icon: CreditCard },
      { title: "Boost Marketing", href: "/docs/coach/boost", icon: Rocket },
      { title: "AI Tools", href: "/docs/coach/ai", icon: Sparkles },
      { title: "Automations", href: "/docs/coach/automations", icon: Settings },
      { title: "Managing Reviews", href: "/docs/coach/reviews", icon: Star },
      { title: "Verification", href: "/docs/coach/verification", icon: FileCheck },
      { title: "Earnings & Stripe", href: "/docs/coach/earnings", icon: BarChart3 },
    ],
  },
  {
    title: "Integrations",
    href: "/docs/integrations/wearables",
    icon: Plug,
    children: [
      { title: "Wearables Overview", href: "/docs/integrations/wearables", icon: Settings },
      { title: "Zoom", href: "/docs/integrations/zoom", icon: Plug },
      { title: "Google Meet", href: "/docs/integrations/google-meet", icon: Plug },
      { title: "Google Calendar", href: "/docs/integrations/google-calendar", icon: Calendar },
      { title: "Apple Calendar", href: "/docs/integrations/apple-calendar", icon: Calendar },
      { title: "Fitbit", href: "/docs/integrations/fitbit", icon: Settings },
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
      { title: "Team Management", href: "/docs/admin/team", icon: Shield },
      { title: "Revenue", href: "/docs/admin/revenue", icon: CreditCard },
      { title: "Analytics", href: "/docs/admin/analytics", icon: BarChart3 },
      { title: "Challenges", href: "/docs/admin/challenges", icon: Trophy },
      { title: "Blog", href: "/docs/admin/blog", icon: FileText },
      { title: "Boosts", href: "/docs/admin/boosts", icon: Rocket },
      { title: "Integrations", href: "/docs/admin/integrations", icon: Plug },
      { title: "Audit Log", href: "/docs/admin/audit", icon: FileCheck },
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
    item.children?.some(child => currentPath === child.href);

  const handleClick = () => {
    onNavigate?.();
  };

  // Filter out admin-only items if user is not admin
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="w-full lg:w-64 flex-shrink-0 border-r border-border bg-card/50 p-4 overflow-y-auto">
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
                isActive(item.href) || (isParentActive(item) && !item.children)
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.title}</span>
              {item.children && (
                <ChevronRight className={cn(
                  "h-4 w-4 ml-auto transition-transform",
                  isParentActive(item) && "rotate-90"
                )} />
              )}
            </Link>

            {item.children && isParentActive(item) && (
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
