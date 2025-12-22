import { AlertTriangle, Heart, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

interface HealthProfileCardProps {
  dietaryRestrictions?: string[] | null;
  allergies?: string[] | null;
  medicalConditions?: string[] | null;
}

export const HealthProfileCard = ({
  dietaryRestrictions,
  allergies,
  medicalConditions,
}: HealthProfileCardProps) => {
  const { t } = useTranslation("coach");
  
  const hasDietary = dietaryRestrictions && dietaryRestrictions.length > 0;
  const hasAllergies = allergies && allergies.length > 0;
  const hasMedical = medicalConditions && medicalConditions.length > 0;

  return (
    <div className="card-elevated p-6 space-y-5">
      <h3 className="font-display font-bold text-foreground">{t('clientDetail.healthProfile.title')}</h3>

      {/* Dietary Restrictions */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Utensils className="w-4 h-4 text-success" />
          <span className="text-sm font-medium text-foreground">{t('clientDetail.healthProfile.dietaryRestrictions')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasDietary ? (
            dietaryRestrictions.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="bg-success/10 text-success border-success/20"
              >
                {item}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted">
              {t('clientDetail.healthProfile.none')}
            </Badge>
          )}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium text-foreground">{t('clientDetail.healthProfile.allergies')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasAllergies ? (
            allergies.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="bg-warning/10 text-warning border-warning/20"
              >
                {item}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted">
              {t('clientDetail.healthProfile.none')}
            </Badge>
          )}
        </div>
      </div>

      {/* Medical Conditions */}
      {hasMedical && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-foreground">{t('clientDetail.healthProfile.medicalConditions')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {medicalConditions.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/20"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
