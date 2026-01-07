import { useState, useEffect } from "react";

const STORAGE_KEY = "app_launch_count";
const LAST_SUGGESTION_KEY = "last_upgrade_suggestion_launch";

/**
 * Tracks app launches and determines if an upgrade suggestion should be shown.
 * Shows suggestion every 5-10 app opens (randomized).
 */
export function useAppLaunchCounter() {
  const [launchCount, setLaunchCount] = useState(0);
  const [shouldShowSuggestion, setShouldShowSuggestion] = useState(false);

  useEffect(() => {
    // Get current count and increment
    const currentCount = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) + 1;
    localStorage.setItem(STORAGE_KEY, currentCount.toString());
    setLaunchCount(currentCount);

    // Get the launch count when we last showed a suggestion
    const lastSuggestionLaunch = parseInt(localStorage.getItem(LAST_SUGGESTION_KEY) || "0", 10);
    
    // Calculate launches since last suggestion
    const launchesSinceLastSuggestion = currentCount - lastSuggestionLaunch;
    
    // Show suggestion every 5-10 launches (random threshold each time)
    const threshold = Math.floor(Math.random() * 6) + 5; // 5-10
    
    if (launchesSinceLastSuggestion >= threshold) {
      setShouldShowSuggestion(true);
      // Record that we're showing a suggestion at this launch count
      localStorage.setItem(LAST_SUGGESTION_KEY, currentCount.toString());
    }
  }, []);

  const dismissSuggestion = () => {
    setShouldShowSuggestion(false);
  };

  return {
    launchCount,
    shouldShowSuggestion,
    dismissSuggestion,
  };
}
