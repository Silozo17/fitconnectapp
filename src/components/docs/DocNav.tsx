import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  BarChart3
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ElementType;
  children?: NavItem[];
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
      { title: "Tracking Progress", href: "/docs/client/progress", icon: TrendingUp },
      { title: "Achievements & Leaderboards", href: "/docs/client/achievements", icon: Trophy },
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
      { title: "Messaging & Templates", href: "/docs/coach/messaging", icon: MessageSquare },
      { title: "Building Plans", href: "/docs/coach/plans", icon: ClipboardList },
      { title: "Schedule & Sessions", href: "/docs/coach/schedule", icon: Calendar },
      { title: "Packages & Pricing", href: "/docs/coach/packages", icon: CreditCard },
      { title: "Verification", href: "/docs/coach/verification", icon: FileCheck },
      { title: "Earnings & Stripe", href: "/docs/coach/earnings", icon: BarChart3 },
    ],
  },
  {
    title: "For Administrators",
    href: "/docs/admin",
    icon: Shield,
  },
];

interface DocNavProps {
  onNavigate?: () => void;
}

export function DocNav({ onNavigate }: DocNavProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (href: string) => currentPath === href;
  const isParentActive = (item: NavItem) => 
    currentPath.startsWith(item.href) || 
    item.children?.some(child => currentPath === child.href);

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <nav className="w-full lg:w-64 flex-shrink-0 border-r border-border bg-card/50 p-4 overflow-y-auto">
      <div className="mb-6">
        <Link to="/docs" className="flex items-center gap-2 text-primary font-semibold" onClick={handleClick}>
          <BookOpen className="h-5 w-5" />
          <span>Help Center</span>
        </Link>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => (
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