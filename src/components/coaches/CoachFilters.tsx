import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { COACH_TYPE_CATEGORIES, getCoachTypesByCategory } from "@/constants/coachTypes";
import { LocationFilter } from "./LocationFilter";
import { LocationData } from "@/types/ranking";
import { useTranslation } from "@/hooks/useTranslation";
import { BadgeCheck, Award } from "lucide-react";

interface CoachFiltersProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  priceRange?: { min?: number; max?: number };
  onPriceRangeChange: (range: { min?: number; max?: number } | undefined) => void;
  onlineOnly: boolean;
  onOnlineOnlyChange: (value: boolean) => void;
  inPersonOnly: boolean;
  onInPersonOnlyChange: (value: boolean) => void;
  // New filter props
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (value: boolean) => void;
  qualifiedOnly: boolean;
  onQualifiedOnlyChange: (value: boolean) => void;
  // Location filter props
  autoLocation?: LocationData | null;
  manualLocation?: LocationData | null;
  isAutoLocationLoading?: boolean;
  onLocationSelect?: (location: LocationData) => void;
  onClearLocation?: () => void;
  // Variant prop: 'card' for desktop sidebar, 'sheet' for mobile sheet
  variant?: 'card' | 'sheet';
}

const CoachFilters = ({
  selectedTypes,
  onTypesChange,
  priceRange,
  onPriceRangeChange,
  onlineOnly,
  onOnlineOnlyChange,
  inPersonOnly,
  onInPersonOnlyChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  qualifiedOnly,
  onQualifiedOnlyChange,
  autoLocation,
  manualLocation,
  isAutoLocationLoading,
  onLocationSelect,
  onClearLocation,
  variant = 'card',
}: CoachFiltersProps) => {
  const { t } = useTranslation('coaches');
  
  const handleTypeToggle = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onTypesChange(selectedTypes.filter((t) => t !== typeId));
    } else {
      onTypesChange([...selectedTypes, typeId]);
    }
  };

  const handleMinPriceChange = (value: string) => {
    const minVal = value === "" ? undefined : Number(value);
    // If both are empty, clear the filter entirely
    if (minVal === undefined && priceRange?.max === undefined) {
      onPriceRangeChange(undefined);
    } else {
      onPriceRangeChange({ min: minVal, max: priceRange?.max });
    }
  };

  const handleMaxPriceChange = (value: string) => {
    const maxVal = value === "" ? undefined : Number(value);
    // If both are empty, clear the filter entirely
    if (maxVal === undefined && priceRange?.min === undefined) {
      onPriceRangeChange(undefined);
    } else {
      onPriceRangeChange({ min: priceRange?.min, max: maxVal });
    }
  };

  const clearFilters = () => {
    onTypesChange([]);
    onPriceRangeChange(undefined);
    onOnlineOnlyChange(false);
    onInPersonOnlyChange(false);
    onVerifiedOnlyChange(false);
    onQualifiedOnlyChange(false);
    onClearLocation?.();
  };

  const hasActiveFilters =
    selectedTypes.length > 0 || 
    priceRange !== undefined || 
    onlineOnly || 
    inPersonOnly || 
    verifiedOnly || 
    qualifiedOnly ||
    manualLocation !== null;

  // Filter content (shared between variants)
  const filterContent = (
    <div className="space-y-6">
      {/* Clear Filters button for sheet variant */}
      {variant === 'sheet' && hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            {t('filters.clearFilters')}
          </Button>
        </div>
      )}

      {/* Location Filter */}
      {onLocationSelect && onClearLocation && (
        <LocationFilter
          autoLocation={autoLocation ?? null}
          manualLocation={manualLocation ?? null}
          isAutoLocationLoading={isAutoLocationLoading}
          onLocationSelect={onLocationSelect}
          onClearLocation={onClearLocation}
        />
      )}

      {/* Coach Type by Category */}
      <div>
        <h4 className="font-medium mb-3 text-sm">{t('filters.specialty')}</h4>
        <Accordion type="multiple" className="w-full" defaultValue={[]}>
          {COACH_TYPE_CATEGORIES.map((category) => {
            const CategoryIcon = category.icon;
            const typesInCategory = getCoachTypesByCategory(category.id);
            const selectedInCategory = typesInCategory.filter((t) =>
              selectedTypes.includes(t.id)
            ).length;

            return (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="text-sm py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{category.label}</span>
                    {selectedInCategory > 0 && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                        {selectedInCategory}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-6">
                    {typesInCategory.map((type) => (
                      <div key={type.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`${variant}-${type.id}`}
                          checked={selectedTypes.includes(type.id)}
                          onCheckedChange={() => handleTypeToggle(type.id)}
                        />
                        <Label htmlFor={`${variant}-${type.id}`} className="text-sm cursor-pointer">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Price Range - Min/Max Input Fields */}
      <div>
        <h4 className="font-medium mb-3 text-sm">{t('filters.priceRange')}</h4>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor={`${variant}-min-price`} className="text-xs text-muted-foreground">
              {t('filters.minPrice')}
            </Label>
            <Input
              id={`${variant}-min-price`}
              type="number"
              placeholder="£0"
              min={0}
              value={priceRange?.min ?? ""}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className="h-9 mt-1"
            />
          </div>
          <span className="text-muted-foreground pt-5">-</span>
          <div className="flex-1">
            <Label htmlFor={`${variant}-max-price`} className="text-xs text-muted-foreground">
              {t('filters.maxPrice')}
            </Label>
            <Input
              id={`${variant}-max-price`}
              type="number"
              placeholder={t('filters.noLimit') || 'No limit'}
              min={0}
              value={priceRange?.max ?? ""}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="h-9 mt-1"
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="font-medium mb-3 text-sm">{t('filters.availability')}</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${variant}-online`}
              checked={onlineOnly}
              onCheckedChange={(checked) => onOnlineOnlyChange(checked as boolean)}
            />
            <Label htmlFor={`${variant}-online`} className="text-sm cursor-pointer">
              {t('filters.onlineSessions')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${variant}-inPerson`}
              checked={inPersonOnly}
              onCheckedChange={(checked) => onInPersonOnlyChange(checked as boolean)}
            />
            <Label htmlFor={`${variant}-inPerson`} className="text-sm cursor-pointer">
              {t('filters.inPersonSessions')}
            </Label>
          </div>
        </div>
      </div>

      {/* Coach Badges - Verified & Qualified */}
      <div>
        <h4 className="font-medium mb-3 text-sm">{t('filters.badges') || 'Coach Badges'}</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${variant}-verified`}
              checked={verifiedOnly}
              onCheckedChange={(checked) => onVerifiedOnlyChange(checked as boolean)}
            />
            <Label htmlFor={`${variant}-verified`} className="text-sm cursor-pointer flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-blue-500" />
              {t('filters.verifiedOnly') || 'Verified only'}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${variant}-qualified`}
              checked={qualifiedOnly}
              onCheckedChange={(checked) => onQualifiedOnlyChange(checked as boolean)}
            />
            <Label htmlFor={`${variant}-qualified`} className="text-sm cursor-pointer flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              {t('filters.qualifiedOnly') || 'Qualified only'}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  // Sheet variant: render content directly without Card wrapper
  if (variant === 'sheet') {
    return filterContent;
  }

  // Card variant: wrap in Card for desktop sidebar
  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('filters.title')}</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              {t('filters.clearFilters')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filterContent}
      </CardContent>
    </Card>
  );
};

export default CoachFilters;