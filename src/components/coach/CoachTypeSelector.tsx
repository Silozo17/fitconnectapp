import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Plus, X, Sparkles, Check } from "lucide-react";
import {
  COACH_TYPES,
  COACH_TYPE_CATEGORIES,
  getCoachTypesByCategory,
  getCoachTypeById,
  getCoachTypeLabel,
} from "@/constants/coachTypes";

interface CoachTypeSelectorProps {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}

export function CoachTypeSelector({ selectedTypes, onChange }: CoachTypeSelectorProps) {
  const { t } = useTranslation("settings");
  const [customTypeInput, setCustomTypeInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Check if a type is custom (not in predefined list)
  const isCustomType = (typeId: string): boolean => {
    return !getCoachTypeById(typeId) && !COACH_TYPES.some(t => t.label === typeId);
  };

  // Get display label for a type (handles both IDs and labels)
  const getDisplayLabel = (type: string): string => {
    // First check if it's an ID
    const byId = getCoachTypeById(type);
    if (byId) return byId.label;
    
    // Check if it matches a label directly
    const byLabel = COACH_TYPES.find(t => t.label === type);
    if (byLabel) return byLabel.label;
    
    // It's a custom type - clean up the display
    if (type.startsWith("custom_")) {
      return type.replace("custom_", "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return type;
  };

  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onChange(selectedTypes.filter((t) => t !== typeId));
    } else {
      onChange([...selectedTypes, typeId]);
    }
  };

  const removeType = (typeId: string) => {
    onChange(selectedTypes.filter((t) => t !== typeId));
  };

  const handleAddCustomType = () => {
    const trimmed = customTypeInput.trim();
    if (trimmed) {
      const customId = `custom_${trimmed.toLowerCase().replace(/\s+/g, "_")}`;
      if (!selectedTypes.includes(customId) && !selectedTypes.includes(trimmed)) {
        onChange([...selectedTypes, customId]);
      }
      setCustomTypeInput("");
      setShowCustomInput(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Separate selected types into predefined and custom
  const customSelectedTypes = selectedTypes.filter(isCustomType);
  const predefinedSelectedTypes = selectedTypes.filter((t) => !isCustomType(t));

  return (
    <div className="space-y-4">
      <Label className="mb-2 block">{t("marketplace.specialtiesTitle")}</Label>
      
      {/* Selected Types Display */}
      {selectedTypes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t("marketplace.specialtiesSelected")}</p>
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map((type) => {
              const isCustom = isCustomType(type);
              const coachType = getCoachTypeById(type);
              const IconComponent = coachType?.icon;
              
              return (
                <Badge
                  key={type}
                  variant="default"
                  className={`pr-1 gap-1.5 ${
                    isCustom
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {isCustom && <Sparkles className="h-3 w-3" />}
                  {IconComponent && <IconComponent className="h-3 w-3" />}
                  {getDisplayLabel(type)}
                  <button
                    onClick={() => removeType(type)}
                    className="ml-1 rounded-full p-0.5 hover:bg-white/20 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-2">
        {COACH_TYPE_CATEGORIES.map((category) => {
          const categoryTypes = getCoachTypesByCategory(category.id);
          const selectedInCategory = categoryTypes.filter((t) =>
            selectedTypes.includes(t.id) || selectedTypes.includes(t.label)
          ).length;
          const isExpanded = expandedCategories.includes(category.id);
          const CategoryIcon = category.icon;

          return (
            <Collapsible
              key={category.id}
              open={isExpanded}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-3"
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{category.label}</span>
                    {selectedInCategory > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedInCategory}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-muted/30 rounded-lg">
                  {categoryTypes.map((type) => {
                    const isSelected = selectedTypes.includes(type.id) || selectedTypes.includes(type.label);
                    const TypeIcon = type.icon;

                    return (
                      <button
                        key={type.id}
                        onClick={() => toggleType(type.id)}
                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-all text-left ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-background hover:bg-secondary border border-border"
                        }`}
                      >
                        <TypeIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{type.label}</span>
                        {isSelected && <Check className="h-3 w-3 ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Custom Type Input */}
      <div className="pt-2">
        {showCustomInput ? (
          <div className="flex gap-2">
            <Input
              value={customTypeInput}
              onChange={(e) => setCustomTypeInput(e.target.value)}
              placeholder={t("marketplace.specialtiesCustomPlaceholder")}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomType();
                }
              }}
              autoFocus
            />
            <Button onClick={handleAddCustomType} size="sm">
              {t("marketplace.specialtiesAdd")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCustomInput(false);
                setCustomTypeInput("");
              }}
            >
              {t("marketplace.specialtiesCancel")}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("marketplace.specialtiesAddCustom")}
          </Button>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {t("marketplace.specialtiesCustomHint")}
        </p>
      </div>
    </div>
  );
}
