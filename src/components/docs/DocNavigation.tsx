import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { docsNavigationOrder, DocPage } from "@/data/docsNavigationOrder";

export function DocNavigation() {
  const location = useLocation();
  const { role } = useAuth();
  const currentPath = location.pathname;
  
  const isAdmin = role === "admin" || role === "manager" || role === "staff";
  
  // Filter out admin pages if user is not admin
  const visiblePages: DocPage[] = docsNavigationOrder.filter(
    page => !page.adminOnly || isAdmin
  );
  
  // Find current page index
  const currentIndex = visiblePages.findIndex(page => page.href === currentPath);
  
  // If current page not found in order, don't show navigation
  if (currentIndex === -1) {
    return null;
  }
  
  const previousPage = currentIndex > 0 ? visiblePages[currentIndex - 1] : null;
  const nextPage = currentIndex < visiblePages.length - 1 ? visiblePages[currentIndex + 1] : null;
  
  // Don't render if no previous or next page
  if (!previousPage && !nextPage) {
    return null;
  }
  
  return (
    <nav className="mt-12 pt-8 border-t border-border" aria-label="Documentation navigation">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
        {/* Previous Button */}
        {previousPage ? (
          <Link
            to={previousPage.href}
            className="group flex-1 flex items-center gap-3 p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Previous</p>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {previousPage.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1 hidden sm:block" />
        )}
        
        {/* Next Button */}
        {nextPage ? (
          <Link
            to={nextPage.href}
            className="group flex-1 flex items-center justify-end gap-3 p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all"
          >
            <div className="min-w-0 text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Next</p>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {nextPage.title}
              </p>
            </div>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ) : (
          <div className="flex-1 hidden sm:block" />
        )}
      </div>
    </nav>
  );
}
