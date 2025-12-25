import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Loader2, Save, MessageSquare, Clock, Eye } from "lucide-react";

const DELAY_OPTIONS = [
  { value: "0", label: "immediately" },
  { value: "1", label: "1hour" },
  { value: "2", label: "2hours" },
  { value: "6", label: "6hours" },
  { value: "12", label: "12hours" },
  { value: "24", label: "24hours" },
  { value: "48", label: "48hours" },
];

const MAX_MESSAGE_LENGTH = 500;

interface ReviewSettings {
  review_request_mode: "auto" | "manual";
  review_request_delay_hours: number;
  custom_review_message: string | null;
}

export function ReviewRequestSettings() {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [delayHours, setDelayHours] = useState("0");
  const [customMessage, setCustomMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["review-request-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("review_request_mode, review_request_delay_hours, custom_review_message")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as ReviewSettings;
    },
    enabled: !!user,
  });

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      setMode((settings.review_request_mode as "auto" | "manual") || "auto");
      setDelayHours(String(settings.review_request_delay_hours || 0));
      setCustomMessage(settings.custom_review_message || "");
    }
  }, [settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("coach_profiles")
        .update({
          review_request_mode: mode,
          review_request_delay_hours: parseInt(delayHours),
          custom_review_message: customMessage.trim() || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-request-settings"] });
      toast.success(t("reviewRequests.saved"));
    },
    onError: () => {
      toast.error(t("failedToSave"));
    },
  });

  // Check if there are unsaved changes
  const hasChanges = settings && (
    mode !== (settings.review_request_mode || "auto") ||
    delayHours !== String(settings.review_request_delay_hours || 0) ||
    (customMessage.trim() || null) !== (settings.custom_review_message || null)
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t("reviewRequests.title")}</CardTitle>
            <CardDescription>{t("reviewRequests.description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">{t("reviewRequests.mode.label")}</Label>
          <RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value as "auto" | "manual")}
            className="grid gap-3"
          >
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="auto" id="mode-auto" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="mode-auto" className="cursor-pointer font-medium">
                  {t("reviewRequests.mode.auto")}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("reviewRequests.mode.autoDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="manual" id="mode-manual" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="mode-manual" className="cursor-pointer font-medium">
                  {t("reviewRequests.mode.manual")}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("reviewRequests.mode.manualDesc")}
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Delay Selection (only for auto mode) */}
        {mode === "auto" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label>{t("reviewRequests.delay.label")}</Label>
            </div>
            <Select value={delayHours} onValueChange={setDelayHours}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELAY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`reviewRequests.delay.${option.label}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("reviewRequests.delay.hint")}
            </p>
          </div>
        )}

        {/* Custom Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label>{t("reviewRequests.customMessage.label")}</Label>
            </div>
            <span className="text-xs text-muted-foreground">
              {customMessage.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            placeholder={t("reviewRequests.customMessage.placeholder")}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {t("reviewRequests.customMessage.hint")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("reviewRequests.customMessage.variables")}
          </p>
        </div>

        {/* Preview Button */}
        {customMessage && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? t("reviewRequests.preview.hide") : t("reviewRequests.preview.show")}
            </Button>
            
            {showPreview && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-medium mb-2">{t("reviewRequests.preview.title")}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {customMessage
                    .replace("{client_name}", "John")
                    .replace("{session_date}", new Date().toLocaleDateString())}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t("saveChanges")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
