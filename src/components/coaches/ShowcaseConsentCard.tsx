import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Award, Shield, ShieldOff, Loader2, Eye, EyeOff, User, Camera } from "lucide-react";
import {
  ConsentType,
  ShowcaseConsent,
  useGrantShowcaseConsent,
  useUpdateShowcaseConsent,
  useRevokeShowcaseConsent,
} from "@/hooks/useClientShowcaseConsents";

interface ShowcaseConsentCardProps {
  coachId: string;
  coachName: string;
  existingConsent: ShowcaseConsent | null;
}

const CONSENT_OPTIONS: { value: ConsentType; labelKey: string; descKey: string; icon: typeof Eye }[] = [
  {
    value: "stats_only",
    labelKey: "showcase.consent.statsOnly",
    descKey: "showcase.consent.statsOnlyDesc",
    icon: Eye,
  },
  {
    value: "with_photos",
    labelKey: "showcase.consent.withPhotos",
    descKey: "showcase.consent.withPhotosDesc",
    icon: Camera,
  },
  {
    value: "with_name",
    labelKey: "showcase.consent.withName",
    descKey: "showcase.consent.withNameDesc",
    icon: User,
  },
  {
    value: "full",
    labelKey: "showcase.consent.full",
    descKey: "showcase.consent.fullDesc",
    icon: Award,
  },
];

export function ShowcaseConsentCard({ coachId, coachName, existingConsent }: ShowcaseConsentCardProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<ConsentType>(
    existingConsent?.consentType || "stats_only"
  );

  const grantConsent = useGrantShowcaseConsent();
  const updateConsent = useUpdateShowcaseConsent();
  const revokeConsent = useRevokeShowcaseConsent();

  const isPending = grantConsent.isPending || updateConsent.isPending || revokeConsent.isPending;

  const handleGrant = () => {
    grantConsent.mutate({ coachId, consentType: selectedType });
  };

  const handleUpdate = () => {
    updateConsent.mutate({ coachId, consentType: selectedType });
  };

  const handleRevoke = () => {
    if (existingConsent) {
      revokeConsent.mutate(existingConsent.id);
    }
  };

  const getConsentBadgeVariant = (type: ConsentType) => {
    switch (type) {
      case "full":
        return "default";
      case "with_name":
        return "secondary";
      case "with_photos":
        return "outline";
      default:
        return "outline";
    }
  };

  const getConsentLabel = (type: ConsentType) => {
    switch (type) {
      case "full":
        return t("showcase.consent.full", "Full Permission");
      case "with_name":
        return t("showcase.consent.withName", "With Name");
      case "with_photos":
        return t("showcase.consent.withPhotos", "With Photos");
      default:
        return t("showcase.consent.statsOnly", "Stats Only");
    }
  };

  return (
    <div className="space-y-4 pt-3">
      <p className="text-sm text-muted-foreground">
        {t(
          "showcase.consent.description",
          "Allow your coach to feature your transformation on their profile"
        )}
      </p>

      {existingConsent ? (
        <>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-success" />
            <span className="text-foreground">
              {t("showcase.consent.currentLevel", "Current permission:")}
            </span>
            <Badge variant={getConsentBadgeVariant(existingConsent.consentType)}>
              {getConsentLabel(existingConsent.consentType)}
            </Badge>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {t("showcase.consent.changeLevel", "Change permission level")}
            </Label>
            <RadioGroup
              value={selectedType}
              onValueChange={(val) => setSelectedType(val as ConsentType)}
              className="space-y-2"
            >
              {CONSENT_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 rounded-lg border border-border/50 p-3 hover:bg-secondary/50 transition-colors"
                >
                  <RadioGroupItem value={option.value} id={`consent-${option.value}`} />
                  <Label
                    htmlFor={`consent-${option.value}`}
                    className="flex flex-1 cursor-pointer items-center gap-3"
                  >
                    <option.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t(option.labelKey, option.value)}</p>
                      <p className="text-xs text-muted-foreground">{t(option.descKey, "")}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isPending || selectedType === existingConsent.consentType}
            >
              {updateConsent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("showcase.consent.updatePermission", "Update Permission")}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                  <ShieldOff className="w-4 h-4 mr-2" />
                  {t("showcase.consent.revoke", "Revoke")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("showcase.consent.revokeTitle", "Revoke Permission?")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t(
                      "showcase.consent.revokeWarning",
                      "This will remove your transformation from the coach's public showcase. They will need your permission again to feature your progress."
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRevoke}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {revokeConsent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t("showcase.consent.yesRevoke", "Yes, Revoke")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm">
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t("showcase.consent.notShared", "Not sharing transformation data")}
            </span>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {t("showcase.consent.selectLevel", "Select permission level")}
            </Label>
            <RadioGroup
              value={selectedType}
              onValueChange={(val) => setSelectedType(val as ConsentType)}
              className="space-y-2"
            >
              {CONSENT_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 rounded-lg border border-border/50 p-3 hover:bg-secondary/50 transition-colors"
                >
                  <RadioGroupItem value={option.value} id={`consent-new-${option.value}`} />
                  <Label
                    htmlFor={`consent-new-${option.value}`}
                    className="flex flex-1 cursor-pointer items-center gap-3"
                  >
                    <option.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t(option.labelKey, option.value)}</p>
                      <p className="text-xs text-muted-foreground">{t(option.descKey, "")}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button size="sm" onClick={handleGrant} disabled={isPending}>
            {grantConsent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Shield className="w-4 h-4 mr-2" />
            {t("showcase.consent.grantPermission", "Grant Permission")}
          </Button>
        </>
      )}
    </div>
  );
}
