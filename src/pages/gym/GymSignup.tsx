import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MemberSignupWizard } from "@/components/gym/signup/MemberSignupWizard";
import { Building2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GymSignup() {
  const { gymId } = useParams<{ gymId: string }>();

  // Fetch gym by ID
  const { data: gym, isLoading, error } = useQuery({
    queryKey: ["public-gym-by-id", gymId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_profiles")
        .select("id, name, slug, logo_url, status, primary_color")
        .eq("id", gymId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!gymId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Gym not found or inactive
  if (!gym || gym.status !== "active") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold">Gym Not Found</h1>
              <p className="text-muted-foreground">
                The gym you're looking for doesn't exist or is no longer accepting new members.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
              >
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto py-4 px-4">
          <div className="flex items-center gap-3">
            {gym.logo_url ? (
              <img
                src={gym.logo_url}
                alt={gym.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: gym.primary_color || 'hsl(var(--primary))' }}
              >
                <Building2 className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-semibold">{gym.name}</h1>
              <p className="text-sm text-muted-foreground">Member Signup</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-3xl mx-auto py-8 px-4">
        <MemberSignupWizard gymId={gym.id} gymSlug={gym.slug} />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-8">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a
              href="https://getfitconnect.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              FitConnect
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
