import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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

interface CoachFiltersProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  priceRange?: { min: number; max: number };
  onPriceRangeChange: (range: { min: number; max: number } | undefined) => void;
  onlineOnly: boolean;
  onOnlineOnlyChange: (value: boolean) => void;
  inPersonOnly: boolean;
  onInPersonOnlyChange: (value: boolean) => void;
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

  const handlePriceChange = (values: number[]) => {
    onPriceRangeChange({ min: values[0], max: values[1] });
  };

  const clearFilters = () => {
    onTypesChange([]);
    onPriceRangeChange(undefined);
    onOnlineOnlyChange(false);
    onInPersonOnlyChange(false);
    onClearLocation?.();
  };

  const hasActiveFilters =
    selectedTypes.length > 0 || priceRange || onlineOnly || inPersonOnly || manualLocation !== null;

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

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3 text-sm">{t('filters.priceRange')}</h4>
        <Slider
          value={[priceRange?.min ?? 0, priceRange?.max ?? 500]}
          onValueChange={handlePriceChange}
          max={500}
          step={10}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>£{priceRange?.min ?? 0}</span>
          <span>£{priceRange?.max ?? 500}+</span>
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
