import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Heart,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Home", icon: Home, path: "/dashboard/client" },
  { title: "My Coaches", icon: Users, path: "/dashboard/client/coaches" },
  { title: "Favourites", icon: Heart, path: "/dashboard/client/favourites" },
  { title: "Sessions", icon: Calendar, path: "/dashboard/client/sessions" },
  { title: "Messages", icon: MessageSquare, path: "/dashboard/client/messages" },
  { title: "My Plans", icon: ClipboardList, path: "/dashboard/client/plans" },
  { title: "Habits", icon: Target, path: "/dashboard/client/habits" },
  { title: "Progress", icon: TrendingUp, path: "/dashboard/client/progress" },
  { title: "Settings", icon: Settings, path: "/dashboard/client/settings" },
];

interface ClientSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const ClientSidebar = ({ collapsed, onToggle }: ClientSidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-foreground">FitConnect</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

export default ClientSidebar;
