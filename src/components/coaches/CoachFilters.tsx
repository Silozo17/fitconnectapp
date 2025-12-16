import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const COACH_TYPES = [
  "Personal Trainer",
  "Nutritionist",
  "Boxing Coach",
  "MMA Coach",
  "Yoga Instructor",
  "Strength Coach",
  "CrossFit Coach",
  "Running Coach",
];

interface CoachFiltersProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  priceRange?: { min: number; max: number };
  onPriceRangeChange: (range: { min: number; max: number } | undefined) => void;
  onlineOnly: boolean;
  onOnlineOnlyChange: (value: boolean) => void;
  inPersonOnly: boolean;
  onInPersonOnlyChange: (value: boolean) => void;
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
}: CoachFiltersProps) => {
  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
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
  };

  const hasActiveFilters =
    selectedTypes.length > 0 || priceRange || onlineOnly || inPersonOnly;

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coach Type */}
        <div>
          <h4 className="font-medium mb-3 text-sm">Specialty</h4>
          <div className="space-y-2">
            {COACH_TYPES.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => handleTypeToggle(type)}
                />
                <Label htmlFor={type} className="text-sm cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3 text-sm">Price Range</h4>
          <Slider
            value={[priceRange?.min ?? 0, priceRange?.max ?? 500]}
            onValueChange={handlePriceChange}
            max={500}
            step={10}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${priceRange?.min ?? 0}</span>
            <span>${priceRange?.max ?? 500}+</span>
          </div>
        </div>

        {/* Availability */}
        <div>
          <h4 className="font-medium mb-3 text-sm">Availability</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="online"
                checked={onlineOnly}
                onCheckedChange={(checked) => onOnlineOnlyChange(checked as boolean)}
              />
              <Label htmlFor="online" className="text-sm cursor-pointer">
                Online Sessions
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="inPerson"
                checked={inPersonOnly}
                onCheckedChange={(checked) => onInPersonOnlyChange(checked as boolean)}
              />
              <Label htmlFor="inPerson" className="text-sm cursor-pointer">
                In-Person Sessions
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoachFilters;
