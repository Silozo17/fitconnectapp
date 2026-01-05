import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { clearAllNativeCache } from "@/lib/native-cache";
import { clearViewState } from "@/lib/view-restoration";
import { Loader2 } from "lucide-react";

/**
 * Emergency reset page that clears all app state and redirects to auth.
 * Accessible at /reset for users stuck in error states.
 */
const Reset = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Clearing app data...");

  useEffect(() => {
    const performReset = async () => {
      try {
        // Step 1: Clear all localStorage except essential items
        setStatus("Clearing local storage...");
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch {}
        });

        // Step 2: Clear sessionStorage
        setStatus("Clearing session storage...");
        sessionStorage.clear();

        // Step 3: Clear native cache
        setStatus("Clearing native cache...");
        clearAllNativeCache();

        // Step 4: Clear view state
        setStatus("Clearing view state...");
        clearViewState();

        // Step 5: Sign out from Supabase
        setStatus("Signing out...");
        await supabase.auth.signOut();

        // Step 6: Redirect to auth
        setStatus("Redirecting...");
        
        // Small delay to ensure all cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use window.location for a hard redirect to ensure clean state
        window.location.href = "/auth";
      } catch (error) {
        console.error("[Reset] Error during reset:", error);
        // Even if there's an error, try to redirect
        window.location.href = "/auth";
      }
    };

    performReset();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

export default Reset;
