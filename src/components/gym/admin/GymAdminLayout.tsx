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
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--gym-content-bg))]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--gym-primary))]" />
          <p className="text-[hsl(var(--gym-card-muted))]">Loading gym...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !gym) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--gym-content-bg))]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-[hsl(var(--gym-danger))]" />
          <h1 className="text-2xl font-bold text-[hsl(var(--gym-card-fg))]">Gym Not Found</h1>
          <p className="text-[hsl(var(--gym-card-muted))] max-w-md">
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
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--gym-content-bg))]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-[hsl(var(--gym-warning))]" />
          <h1 className="text-2xl font-bold text-[hsl(var(--gym-card-fg))]">Access Denied</h1>
          <p className="text-[hsl(var(--gym-card-muted))] max-w-md">
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
    <div className="gym-admin flex h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <GymAdminSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <div className="gym-content">
        <GymAdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="gym-content-body overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
