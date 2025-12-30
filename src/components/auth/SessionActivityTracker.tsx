import { useSessionActivity } from "@/hooks/useSessionActivity";

/**
 * Component that tracks user session activity.
 * Must be rendered inside AuthProvider.
 */
export const SessionActivityTracker = () => {
  useSessionActivity();
  return null;
};
