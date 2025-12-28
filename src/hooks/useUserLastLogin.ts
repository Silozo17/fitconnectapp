import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";

export function useUserLastLogin(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-last-login", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase.functions.invoke("admin-user-management", {
        body: { action: "get_user_email", userId },
      });

      if (error) throw error;
      
      const lastSignInAt = data?.lastSignInAt || data?.last_sign_in_at;
      
      if (!lastSignInAt) {
        return {
          lastSignInAt: null,
          relativeTime: "Never",
          absoluteTime: null,
        };
      }

      const date = new Date(lastSignInAt);
      return {
        lastSignInAt,
        relativeTime: formatDistanceToNow(date, { addSuffix: true }),
        absoluteTime: format(date, "MMM d, yyyy 'at' h:mm a"),
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
