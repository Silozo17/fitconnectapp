import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCaseStudyGenerator } from "@/hooks/useCaseStudyGenerator";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CaseStudyGenerator({ open, onOpenChange }: Props) {
  const { t } = useTranslation("coach");
  const { user } = useAuth();
  const [selectedShowcaseId, setSelectedShowcaseId] = useState("");
  const { generateCaseStudy, isGenerating } = useCaseStudyGenerator();

  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("coach_profiles").select("id").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: showcases = [] } = useQuery({
    queryKey: ["coach-showcases", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data } = await supabase
        .from("coach_outcome_showcases")
        .select("id, title, client:client_profiles!coach_outcome_showcases_client_id_fkey(first_name, last_name)")
        .eq("coach_id", coachProfile.id)
        .eq("is_published", true);
      return data || [];
    },
    enabled: !!coachProfile,
  });

  const handleGenerate = () => {
    if (selectedShowcaseId) {
      generateCaseStudy(selectedShowcaseId);
      onOpenChange(false);
      setSelectedShowcaseId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t("caseStudies.generate")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>{t("caseStudies.selectShowcase")}</Label>
            <Select value={selectedShowcaseId} onValueChange={setSelectedShowcaseId}>
              <SelectTrigger>
                <SelectValue placeholder={t("caseStudies.selectShowcasePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {showcases.map((showcase: any) => (
                  <SelectItem key={showcase.id} value={showcase.id}>
                    {showcase.title || `${showcase.client?.first_name} ${showcase.client?.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showcases.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("caseStudies.noShowcasesAvailable")}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common:common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleGenerate} disabled={!selectedShowcaseId || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("caseStudies.generating")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t("caseStudies.generate")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
