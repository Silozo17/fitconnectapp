import { useState } from "react";
import { Outlet } from "react-router-dom";
import { GymAdminSidebar } from "./GymAdminSidebar";
import { GymAdminHeader } from "./GymAdminHeader";
import { useGym } from "@/contexts/GymContext";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function GymAdminLayout() {
  const { gym, isLoading, error, isStaff } = useGym();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading gym...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !gym) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Gym Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            The gym you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link to="/coach/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isStaff) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access the admin area of this gym.
          </p>
          <Button asChild>
            <Link to={`/gym/${gym.slug}`}>View Public Site</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <GymAdminSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <GymAdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
