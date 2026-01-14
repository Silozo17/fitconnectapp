import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function EmbedSignup() {
  const { gymSlug } = useParams<{ gymSlug: string }>();
  const navigate = useNavigate();

  // Fetch gym by slug
  const { data: gym } = useQuery({
    queryKey: ["gym-by-slug", gymSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_profiles")
        .select("id, name, slug, logo_url, primary_color")
        .eq("slug", gymSlug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!gymSlug,
  });

  // Fetch membership plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["embed-plans", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await (supabase as any)
        .from("gym_membership_plans")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("is_active", true)
        .order("price");

      if (error) throw error;
      return data as any[];
    },
    enabled: !!gym?.id,
  });

  const handleSelectPlan = (planId: string) => {
    // Redirect to full signup page
    window.open(`/club/${gym?.slug}/signup?plan=${planId}`, "_blank");
  };

  if (!gym) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 bg-background min-h-screen font-sans">
      {/* Header */}
      <div className="text-center mb-6">
        {gym.logo_url && (
          <img src={gym.logo_url} alt={gym.name} className="h-12 w-12 rounded mx-auto mb-2" />
        )}
        <h1 className="text-xl font-bold">{gym.name}</h1>
        <p className="text-muted-foreground">Choose your membership</p>
      </div>

      {/* Plans */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No membership plans available
        </div>
      ) : (
        <div className="grid gap-4 max-w-2xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden">
              {plan.is_featured && (
                <Badge className="absolute top-2 right-2">Popular</Badge>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">
                    {plan.currency === "GBP" ? "£" : plan.currency === "EUR" ? "€" : "$"}
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">
                    /{plan.billing_interval === "month" ? "mo" : plan.billing_interval}
                  </span>
                </div>

                {plan.features && Array.isArray(plan.features) && (
                  <ul className="space-y-1 mb-4">
                    {(plan.features as string[]).slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  className="w-full"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Select Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        Powered by FitConnect
      </div>
    </div>
  );
}
