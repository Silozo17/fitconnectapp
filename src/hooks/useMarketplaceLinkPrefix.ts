import { useLocation } from "react-router-dom";

/**
 * Hook to determine the correct marketplace link prefix based on current route context.
 * - Returns "/dashboard/client/marketplace" when inside client dashboard
 * - Returns "/marketplace" for public pages
 */
export const useMarketplaceLinkPrefix = () => {
  const location = useLocation();
  
  if (location.pathname.startsWith("/dashboard/client/")) {
    return "/dashboard/client/marketplace";
  }
  
  return "/marketplace";
};

/**
 * Helper function for components that can't use hooks (rare cases)
 */
export const getMarketplaceLinkPrefix = (pathname: string) => {
  if (pathname.startsWith("/dashboard/client/")) {
    return "/dashboard/client/marketplace";
  }
  return "/marketplace";
};
