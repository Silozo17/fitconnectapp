import { AlertTriangle, Heart, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const hasDietary = dietaryRestrictions && dietaryRestrictions.length > 0;
  const hasAllergies = allergies && allergies.length > 0;
  const hasMedical = medicalConditions && medicalConditions.length > 0;
  const hasAnyData = hasDietary || hasAllergies || hasMedical;

  if (!hasAnyData) {
    return (
      <div className="card-elevated p-6">
        <h3 className="font-display font-bold text-foreground mb-4">Health Profile</h3>
        <p className="text-muted-foreground text-sm">No health information provided yet.</p>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 space-y-5">
      <h3 className="font-display font-bold text-foreground">Health Profile</h3>

      {/* Dietary Restrictions */}
      {hasDietary && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-foreground">Dietary Restrictions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dietaryRestrictions.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="bg-success/10 text-success border-success/20"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Allergies */}
      {hasAllergies && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-foreground">Allergies</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="bg-warning/10 text-warning border-warning/20"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Medical Conditions */}
      {hasMedical && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-foreground">Medical Conditions</span>
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
