import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface CoachFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  specialty: string;
  location: string;
  priceRange: string;
  sessionType: string;
}

const CoachFilters = ({ onFilterChange }: CoachFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    specialty: "",
    location: "",
    priceRange: "",
    sessionType: "",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const specialties = [
    { value: "personal-training", label: "Personal Training" },
    { value: "nutrition", label: "Nutrition Coaching" },
    { value: "boxing", label: "Boxing" },
    { value: "mma", label: "MMA / Combat Sports" },
  ];

  const locations = [
    { value: "london", label: "London" },
    { value: "manchester", label: "Manchester" },
    { value: "birmingham", label: "Birmingham" },
    { value: "leeds", label: "Leeds" },
    { value: "online", label: "Online Only" },
  ];

  const priceRanges = [
    { value: "0-40", label: "Under £40" },
    { value: "40-60", label: "£40 - £60" },
    { value: "60-80", label: "£60 - £80" },
    { value: "80+", label: "£80+" },
  ];

  const sessionTypes = [
    { value: "in-person", label: "In-Person" },
    { value: "online", label: "Online" },
    { value: "both", label: "Both" },
  ];

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      search: "",
      specialty: "",
      location: "",
      priceRange: "",
      sessionType: "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== "").length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search coaches by name or specialty..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-12 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button
          variant="outline"
          className="md:hidden h-12 px-4 border-border text-foreground"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <SlidersHorizontal className="w-5 h-5" />
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex gap-3 flex-wrap">
        <Select
          value={filters.specialty}
          onValueChange={(value) => updateFilter("specialty", value)}
        >
          <SelectTrigger className="w-[180px] bg-card border-border text-foreground">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {specialties.map((item) => (
              <SelectItem key={item.value} value={item.value} className="text-foreground">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.location}
          onValueChange={(value) => updateFilter("location", value)}
        >
          <SelectTrigger className="w-[180px] bg-card border-border text-foreground">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {locations.map((item) => (
              <SelectItem key={item.value} value={item.value} className="text-foreground">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priceRange}
          onValueChange={(value) => updateFilter("priceRange", value)}
        >
          <SelectTrigger className="w-[160px] bg-card border-border text-foreground">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {priceRanges.map((item) => (
              <SelectItem key={item.value} value={item.value} className="text-foreground">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sessionType}
          onValueChange={(value) => updateFilter("sessionType", value)}
        >
          <SelectTrigger className="w-[160px] bg-card border-border text-foreground">
            <SelectValue placeholder="Session Type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {sessionTypes.map((item) => (
              <SelectItem key={item.value} value={item.value} className="text-foreground">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <div className="md:hidden card-elevated p-4 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-semibold text-foreground">Filters</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                Clear All
              </Button>
            )}
          </div>

          <Select
            value={filters.specialty}
            onValueChange={(value) => updateFilter("specialty", value)}
          >
            <SelectTrigger className="w-full bg-secondary border-border text-foreground">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {specialties.map((item) => (
                <SelectItem key={item.value} value={item.value} className="text-foreground">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.location}
            onValueChange={(value) => updateFilter("location", value)}
          >
            <SelectTrigger className="w-full bg-secondary border-border text-foreground">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {locations.map((item) => (
                <SelectItem key={item.value} value={item.value} className="text-foreground">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priceRange}
            onValueChange={(value) => updateFilter("priceRange", value)}
          >
            <SelectTrigger className="w-full bg-secondary border-border text-foreground">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {priceRanges.map((item) => (
                <SelectItem key={item.value} value={item.value} className="text-foreground">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sessionType}
            onValueChange={(value) => updateFilter("sessionType", value)}
          >
            <SelectTrigger className="w-full bg-secondary border-border text-foreground">
              <SelectValue placeholder="Session Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {sessionTypes.map((item) => (
                <SelectItem key={item.value} value={item.value} className="text-foreground">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CoachFilters;
