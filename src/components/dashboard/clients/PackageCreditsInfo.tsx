import { Package, Check, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface PackageCreditsInfoProps {
  activePackage: {
    id: string;
    sessions_total: number;
    sessions_used: number | null;
    expires_at: string | null;
    coach_packages?: {
      name: string;
    } | null | any; // Allow any due to Supabase typing limitations
  } | null | undefined;
  useCredits?: boolean;
  onUseCreditsChange?: (value: boolean) => void;
  compact?: boolean;
}

export function PackageCreditsInfo({ 
  activePackage, 
  useCredits = true,
  onUseCreditsChange,
  compact = false,
}: PackageCreditsInfoProps) {
  const { t } = useTranslation("coach");

  if (!activePackage) {
    if (compact) return null;
    
    return (
      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="h-4 w-4" />
          <span className="text-sm">{t("packageCredits.noPackage")}</span>
        </div>
      </div>
    );
  }

  const tokensRemaining = activePackage.sessions_total - (activePackage.sessions_used || 0);
  const progressPercent = (tokensRemaining / activePackage.sessions_total) * 100;
  const packageName = activePackage.coach_packages?.name || t("packageCredits.package");
  const isLowCredits = tokensRemaining <= 2;
  const expiresAt = activePackage.expires_at ? new Date(activePackage.expires_at) : null;
  const isExpiringSoon = expiresAt && (expiresAt.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          {tokensRemaining}/{activePackage.sessions_total}
        </span>
        {isLowCredits && (
          <AlertTriangle className="h-3 w-3 text-warning" />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">{t("packageCredits.title")}</span>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          {packageName}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">{t("packageCredits.remaining")}</span>
            <span className="font-semibold text-foreground">
              {tokensRemaining} / {activePackage.sessions_total}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {expiresAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("packageCredits.expires")}</span>
            <span className={isExpiringSoon ? "text-warning font-medium" : "text-muted-foreground"}>
              {format(expiresAt, "d MMM yyyy")}
            </span>
          </div>
        )}

        {onUseCreditsChange && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Checkbox 
              id="useCredits" 
              checked={useCredits}
              onCheckedChange={(checked) => onUseCreditsChange(checked === true)}
            />
            <Label 
              htmlFor="useCredits" 
              className="text-sm cursor-pointer flex items-center gap-1"
            >
              <Check className="h-3 w-3 text-primary" />
              {t("packageCredits.useCredit")}
            </Label>
          </div>
        )}

        {isLowCredits && (
          <div className="flex items-center gap-2 text-warning text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{t("packageCredits.lowCredits")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
