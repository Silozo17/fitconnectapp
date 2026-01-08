import { useLocation } from "react-router-dom";

export const useCoachLinkPrefix = () => {
  const location = useLocation();
  
  // If inside client dashboard, use internal route (handles both /dashboard/client and /dashboard/client/*)
  if (location.pathname === "/dashboard/client" || location.pathname.startsWith("/dashboard/client/")) {
    return "/dashboard/client/coaches";
  }
  
  // Default to public route
  return "/coaches";
};
