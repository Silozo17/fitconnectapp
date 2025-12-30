import { usePushNotifications } from "@/hooks/usePushNotifications";

/**
 * Global push notification initializer component.
 * Must be rendered inside AuthProvider to access user context.
 * 
 * This component:
 * 1. Sets the OneSignal external user ID on every app load (links user ID to device)
 * 2. Auto-registers the device for push notifications
 */
export const PushNotificationInitializer = () => {
  // The hook handles all initialization logic internally via useEffect
  usePushNotifications();
  return null;
};
