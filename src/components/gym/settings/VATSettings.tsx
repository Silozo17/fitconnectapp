import { useState, useEffect } from "react";
import { useGym } from "@/contexts/GymContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export function VATSettings() {
  const { gym, refetch } = useGym();
  const [isSaving, setIsSaving] = useState(false);
  const [vatRegistered, setVatRegistered] = useState(false);
  const [vatNumber, setVatNumber] = useState("");

  useEffect(() => {
    if (gym) {
      // Use type assertion for new columns not yet in generated types
      const gymData = gym as typeof gym & { vat_registered?: boolean; vat_number?: string };
      setVatRegistered(gymData.vat_registered || false);
      setVatNumber(gymData.vat_number || "");
    }
  }, [gym]);

  const handleSave = async () => {
    if (!gym?.id) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("gym_profiles")
        .update({
          vat_registered: vatRegistered,
          vat_number: vatRegistered ? vatNumber : null,
        })
        .eq("id", gym.id);

      if (error) throw error;
      
      toast.success("VAT settings saved");
      refetch?.();
    } catch (error) {
      console.error("Error saving VAT settings:", error);
      toast.error("Failed to save VAT settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>VAT Registration</CardTitle>
        <CardDescription>
          Configure your VAT registration status and number
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label className="text-base font-medium">VAT Registered</Label>
            <p className="text-sm text-muted-foreground">
              Enable if your business is registered for VAT
            </p>
          </div>
          <Switch
            checked={vatRegistered}
            onCheckedChange={setVatRegistered}
          />
        </div>

        {vatRegistered && (
          <div className="space-y-2">
            <Label htmlFor="vat-number">VAT Number</Label>
            <Input
              id="vat-number"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              placeholder="e.g., GB123456789"
            />
            <p className="text-xs text-muted-foreground">
              Your UK VAT registration number
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <Label className="text-sm text-muted-foreground">Currency</Label>
            <p className="text-lg font-medium">{gym?.currency || "GBP"} (£)</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Label className="text-sm text-muted-foreground">Tax Rate</Label>
            <p className="text-lg font-medium">
              {vatRegistered ? "20% VAT" : "No VAT"}
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save VAT Settings
        </Button>
      </CardContent>
    </Card>
  );
}
