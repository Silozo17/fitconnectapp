import { useLocation } from "react-router-dom";

export const useCoachLinkPrefix = () => {
  const location = useLocation();
  
  // If inside client dashboard, use internal route
  if (location.pathname.startsWith("/dashboard/client/")) {
    return "/dashboard/client/find-coaches";
  }
  
  // Default to public route
  return "/coaches";
};
