/**
 * DisciplineSelectionStep - Reusable discipline selection for onboarding
 */

import { cn } from "@/lib/utils";
import { 
  Check, 
  Dumbbell, 
  Swords, 
  Users, 
  PersonStanding, 
  Waves, 
  Bike, 
  Medal, 
  Flame, 
  Mountain,
  Target,
  Goal,
  Circle,
  Hexagon,
  Snowflake,
  Flag,
} from "lucide-react";
import { DISCIPLINE_CATEGORIES, getDisciplineConfig } from "@/config/disciplines/catalog";
import { DisciplineConfig } from "@/config/disciplines/types";

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Swords,
  Users,
  PersonStanding,
  Waves,
  Bike,
  Medal,
  Dumbbell,
  Flame,
  Mountain,
  Target,
  Goal,
  Circle,
  Hexagon,
  Snowflake,
  Flag,
};

interface DisciplineSelectionStepProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  multiple?: boolean;
  selectedIds?: string[];
  onMultiSelect?: (ids: string[]) => void;
}

export function DisciplineSelectionStep({ 
  selectedId, 
  onSelect,
  multiple = false,
  selectedIds = [],
  onMultiSelect,
}: DisciplineSelectionStepProps) {
  
  const handleSelect = (id: string) => {
    if (multiple && onMultiSelect) {
      if (selectedIds.includes(id)) {
        onMultiSelect(selectedIds.filter(i => i !== id));
      } else {
        onMultiSelect([...selectedIds, id]);
      }
    } else {
      // Toggle selection for single mode
      onSelect(selectedId === id ? null : id);
    }
  };

  const isSelected = (id: string) => {
    return multiple ? selectedIds.includes(id) : selectedId === id;
  };

  return (
    <div className="space-y-5">
      <div className="mb-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          Choose your discipline
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          {multiple 
            ? 'Select the sports you train (you can add more later)'
            : 'Select your primary training focus (optional)'
          }
        </p>
      </div>

      {/* Combat Sports */}
      <CategorySection 
        title="Combat Sports"
        disciplines={DISCIPLINE_CATEGORIES.combat.map(id => getDisciplineConfig(id)!).filter(Boolean)}
        isSelected={isSelected}
        onSelect={handleSelect}
      />

      {/* Endurance Sports */}
      <CategorySection 
        title="Endurance Sports"
        disciplines={DISCIPLINE_CATEGORIES.endurance.map(id => getDisciplineConfig(id)!).filter(Boolean)}
        isSelected={isSelected}
        onSelect={handleSelect}
      />

      {/* Strength Sports */}
      <CategorySection 
        title="Strength Sports"
        disciplines={DISCIPLINE_CATEGORIES.strength.map(id => getDisciplineConfig(id)!).filter(Boolean)}
        isSelected={isSelected}
        onSelect={handleSelect}
      />

      {/* Racket Sports */}
      <CategorySection 
        title="Racket Sports"
        disciplines={DISCIPLINE_CATEGORIES.racket.map(id => getDisciplineConfig(id)!).filter(Boolean)}
        isSelected={isSelected}
        onSelect={handleSelect}
      />

      {/* Team Sports */}
      <CategorySection 
        title="Team Sports"
        disciplines={DISCIPLINE_CATEGORIES.team.map(id => getDisciplineConfig(id)!).filter(Boolean)}
        isSelected={isSelected}
        onSelect={handleSelect}
      />

      {/* Other Sports */}
      <CategorySection 
        title="Other Sports"
        disciplines={DISCIPLINE_CATEGORIES.other.map(id => getDisciplineConfig(id)!).filter(Boolean)}
        isSelected={isSelected}
        onSelect={handleSelect}
      />

      <p className="text-xs text-muted-foreground text-center pt-2">
        You can skip this step and add disciplines later from your dashboard
      </p>
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  disciplines: DisciplineConfig[];
  isSelected: (id: string) => boolean;
  onSelect: (id: string) => void;
}

function CategorySection({ title, disciplines, isSelected, onSelect }: CategorySectionProps) {
  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {disciplines.map((config) => {
          const IconComponent = iconMap[config.icon] || Dumbbell;
          const selected = isSelected(config.id);

          return (
            <button
              key={config.id}
              type="button"
              onClick={() => onSelect(config.id)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all relative",
                "hover:border-primary/50 hover:bg-primary/5",
                selected 
                  ? "border-primary bg-primary/10 ring-1 ring-primary" 
                  : "border-border bg-card/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  "bg-gradient-to-br",
                  config.theme.gradient
                )}>
                  <IconComponent className={cn("w-4 h-4", config.theme.accent)} />
                </div>
                <p className="font-medium text-sm truncate">{config.name}</p>
              </div>
              {selected && (
                <div className="absolute top-1.5 right-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
