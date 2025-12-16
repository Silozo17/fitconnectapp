import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  ClipboardList,
  DollarSign,
  Settings,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Package,
  Shield,
  Plug,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Overview", icon: LayoutDashboard, path: "/dashboard/coach" },
  { title: "Clients", icon: Users, path: "/dashboard/coach/clients" },
  { title: "Schedule", icon: Calendar, path: "/dashboard/coach/schedule" },
  { title: "Messages", icon: MessageSquare, path: "/dashboard/coach/messages" },
  { title: "Training Plans", icon: ClipboardList, path: "/dashboard/coach/plans" },
  { title: "Digital Products", icon: ShoppingBag, path: "/dashboard/coach/products" },
  { title: "Packages", icon: Package, path: "/dashboard/coach/packages" },
  { title: "Reviews", icon: MessageSquare, path: "/dashboard/coach/reviews" },
  { title: "Earnings", icon: DollarSign, path: "/dashboard/coach/earnings" },
  { title: "Verification", icon: Shield, path: "/dashboard/coach/verification" },
  { title: "Integrations", icon: Plug, path: "/dashboard/coach/integrations" },
  { title: "Settings", icon: Settings, path: "/dashboard/coach/settings" },
];

interface CoachSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const CoachSidebar = ({ collapsed, onToggle }: CoachSidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Dumbbell className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-xl text-sidebar-foreground">
              FitConnect
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

export default CoachSidebar;
