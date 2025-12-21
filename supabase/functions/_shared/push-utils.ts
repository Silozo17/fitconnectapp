/**
 * Utility function to send push notifications from other edge functions
 */
export async function sendPushNotification(
  supabaseUrl: string,
  supabaseServiceKey: string,
  userIds: string[],
  title: string,
  message: string,
  preferenceKey?: string,
  data?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userIds,
        title,
        message,
        preferenceKey,
        data,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Push notification failed:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error calling push notification function:", error);
    return { success: false, error: error.message };
  }
}
