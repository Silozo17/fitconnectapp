import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  ChevronLeft, 
  ChevronRight,
  Quote,
  TrendingDown,
  Clock,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TransformationItem {
  id: string;
  displayName: string;
  beforePhoto: string | null;
  afterPhoto: string | null;
  stats: {
    weightLost?: string;
    duration?: string;
    bodyFatChange?: string;
  };
  testimonial?: string;
  goalType: string;
}

interface PublicTransformationGalleryProps {
  transformations: TransformationItem[];
  className?: string;
}

export function PublicTransformationGallery({ 
  transformations,
  className 
}: PublicTransformationGalleryProps) {
  const { t } = useTranslation();
  const [selectedGoal, setSelectedGoal] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const goalTypes = useMemo(() => {
    const types = new Set(transformations.map((t) => t.goalType));
    return ["all", ...Array.from(types)];
  }, [transformations]);

  const filteredTransformations = useMemo(() => {
    if (selectedGoal === "all") return transformations;
    return transformations.filter((t) => t.goalType === selectedGoal);
  }, [transformations, selectedGoal]);

  const goalLabels: Record<string, string> = {
    all: t("goals.all", "All"),
    weight_loss: t("goals.weightLoss", "Weight Loss"),
    muscle_gain: t("goals.muscleGain", "Muscle Gain"),
    strength: t("goals.strength", "Strength"),
    endurance: t("goals.endurance", "Endurance"),
    custom: t("goals.custom", "Custom"),
  };

  if (transformations.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          {t("profile.transformations", "Client Transformations")}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {t("profile.transformationsDesc", "Real results from real clients")}
        </p>
      </div>

      {/* Goal Filter Pills */}
      {goalTypes.length > 2 && (
        <div className="flex flex-wrap justify-center gap-2">
          {goalTypes.map((goal) => (
            <Button
              key={goal}
              variant={selectedGoal === goal ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGoal(goal)}
              className="rounded-full"
            >
              {goalLabels[goal] || goal}
            </Button>
          ))}
        </div>
      )}

      {/* Transformations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTransformations.map((item) => (
          <TransformationCard
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface TransformationCardProps {
  item: TransformationItem;
  isExpanded: boolean;
  onToggle: () => void;
}

function TransformationCard({ item, isExpanded, onToggle }: TransformationCardProps) {
  const { t } = useTranslation();
  const [showAfter, setShowAfter] = useState(false);

  return (
    <Card 
      variant="glass" 
      className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded && "ring-2 ring-primary"
      )}
    >
      {/* Photo Slider */}
      <div className="relative aspect-[4/3] bg-secondary/50">
        {item.beforePhoto && item.afterPhoto ? (
          <>
            {/* Before/After Images */}
            <div className="absolute inset-0">
              <div 
                className={cn(
                  "absolute inset-0 bg-cover bg-center transition-opacity duration-300",
                  showAfter ? "opacity-0" : "opacity-100"
                )}
                style={{ backgroundImage: `url(${item.beforePhoto})` }}
              />
              <div 
                className={cn(
                  "absolute inset-0 bg-cover bg-center transition-opacity duration-300",
                  showAfter ? "opacity-100" : "opacity-0"
                )}
                style={{ backgroundImage: `url(${item.afterPhoto})` }}
              />
            </div>

            {/* Before/After Toggle */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowAfter(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium px-2">
                {showAfter ? t("transformation.after", "After") : t("transformation.before", "Before")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowAfter(true)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Labels */}
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 text-xs"
        >
          {showAfter ? t("transformation.after", "After") : t("transformation.before", "Before")}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Client Name & Goal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{item.displayName}</span>
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {item.goalType.replace("_", " ")}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          {item.stats.weightLost && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingDown className="w-3 h-3 text-success" />
              <span className="text-foreground font-medium">{item.stats.weightLost}</span>
            </div>
          )}
          {item.stats.duration && (
            <div className="flex items-center gap-1 text-sm">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">{item.stats.duration}</span>
            </div>
          )}
          {item.stats.bodyFatChange && (
            <Badge variant="secondary" className="text-xs">
              {item.stats.bodyFatChange} {t("transformation.bodyFat", "body fat")}
            </Badge>
          )}
        </div>

        {/* Testimonial */}
        {item.testimonial && (
          <div 
            className={cn(
              "overflow-hidden transition-all duration-300",
              isExpanded ? "max-h-40" : "max-h-0"
            )}
          >
            <div className="pt-3 border-t border-border/50">
              <div className="flex gap-2">
                <Quote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground italic">
                  "{item.testimonial}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expand Button */}
        {item.testimonial && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded 
              ? t("common.showLess", "Show less") 
              : t("common.readTestimonial", "Read testimonial")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}