/**
 * Quick tips for native app splash loading screen
 * Tips rotate every 3 seconds with fade animation
 */

export interface QuickTip {
  text: string;
  platforms: ('ios' | 'android' | 'all')[];
}

export const QUICK_TIPS: QuickTip[] = [
  // iOS Specific
  { text: "Swipe down to refresh your dashboard", platforms: ['ios'] },
  { text: "Use Face ID for quick secure login", platforms: ['ios'] },
  { text: "Connect Apple Health to sync your metrics", platforms: ['ios'] },
  { text: "Long press the app icon for quick actions", platforms: ['ios'] },
  { text: "Add FitConnect to your home screen for quick access", platforms: ['ios'] },
  
  // Android Specific
  { text: "Use the back gesture to navigate", platforms: ['android'] },
  { text: "Enable Google Fit sync in Settings", platforms: ['android'] },
  { text: "Add the widget to your home screen", platforms: ['android'] },
  { text: "Swipe from the edge to go back", platforms: ['android'] },
  { text: "Pin the app for quick access", platforms: ['android'] },
  
  // General Tips - Available on all platforms
  { text: "Track your progress daily for best results", platforms: ['all'] },
  { text: "Message your coach anytime for support", platforms: ['all'] },
  { text: "Complete habits to earn achievement badges", platforms: ['all'] },
  { text: "Book sessions 24/7 from the app", platforms: ['all'] },
  { text: "Enable notifications to stay on track", platforms: ['all'] },
  { text: "Check the leaderboard to see your ranking", platforms: ['all'] },
  { text: "Log your meals to hit your macro targets", platforms: ['all'] },
  { text: "Set reminders for your workout sessions", platforms: ['all'] },
  { text: "Upload progress photos to track changes", platforms: ['all'] },
  { text: "Sync your wearable for automatic tracking", platforms: ['all'] },
  { text: "Explore the marketplace for training plans", platforms: ['all'] },
  { text: "Review your coach to help others find them", platforms: ['all'] },
  { text: "Join challenges to compete with others", platforms: ['all'] },
  { text: "Set goals and track your journey", platforms: ['all'] },
  { text: "Use AI tools to generate meal plans", platforms: ['all'] },
  { text: "Connect with coaches in your area", platforms: ['all'] },
  { text: "Track your habits for consistent progress", platforms: ['all'] },
  { text: "Unlock achievements as you progress", platforms: ['all'] },
  { text: "Your coach can see your wearable data", platforms: ['all'] },
  { text: "Build shopping lists from your meal plans", platforms: ['all'] },
];

/**
 * Get tips filtered by platform
 */
export function getTipsForPlatform(isIOS: boolean, isAndroid: boolean): QuickTip[] {
  return QUICK_TIPS.filter(tip => {
    if (tip.platforms.includes('all')) return true;
    if (isIOS && tip.platforms.includes('ios')) return true;
    if (isAndroid && tip.platforms.includes('android')) return true;
    return false;
  });
}

/**
 * Get a random tip for the platform
 */
export function getRandomTip(isIOS: boolean, isAndroid: boolean): string {
  const tips = getTipsForPlatform(isIOS, isAndroid);
  const randomIndex = Math.floor(Math.random() * tips.length);
  return tips[randomIndex].text;
}
