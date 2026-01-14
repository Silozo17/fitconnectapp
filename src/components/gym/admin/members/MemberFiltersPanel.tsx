import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmartDateInput } from "@/components/ui/smart-date-input";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Search } from "lucide-react";
import { useMembershipPlans } from "@/hooks/gym/useGymMemberships";

interface MemberFilters {
  search: string;
  status: string;
  planId: string;
  joinedFrom: string;
  joinedTo: string;
  dobFrom: string;
  dobTo: string;
  noActiveMembership: boolean;
  expiringWithinDays: number | undefined;
}

interface MemberFiltersPanelProps {
  filters: MemberFilters;
  onFiltersChange: (filters: MemberFilters) => void;
}

export function MemberFiltersPanel({ filters, onFiltersChange }: MemberFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: plans = [] } = useMembershipPlans();

  const activeFilterCount = [
    filters.planId,
    filters.joinedFrom,
    filters.joinedTo,
    filters.dobFrom,
    filters.dobTo,
    filters.noActiveMembership,
    filters.expiringWithinDays,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    onFiltersChange({
      search: filters.search,
      status: filters.status,
      planId: "",
      joinedFrom: "",
      joinedTo: "",
      dobFrom: "",
      dobTo: "",
      noActiveMembership: false,
      expiringWithinDays: undefined,
    });
  };

  const handleQuickFilter = (type: "no-membership" | "expiring-soon") => {
    if (type === "no-membership") {
      onFiltersChange({
        ...filters,
        noActiveMembership: !filters.noActiveMembership,
        expiringWithinDays: undefined,
      });
    } else if (type === "expiring-soon") {
      onFiltersChange({
        ...filters,
        noActiveMembership: false,
        expiringWithinDays: filters.expiringWithinDays ? undefined : 7,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select 
          value={filters.status} 
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        {/* Membership Plan Filter */}
        <Select 
          value={filters.planId} 
          onValueChange={(value) => onFiltersChange({ ...filters, planId: value === "all" ? "" : value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              {/* Join Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Join Date</Label>
                <div className="grid grid-cols-2 gap-2">
                  <SmartDateInput
                    placeholder="From"
                    value={filters.joinedFrom}
                    onChange={(val) => onFiltersChange({ ...filters, joinedFrom: val })}
                  />
                  <SmartDateInput
                    placeholder="To"
                    value={filters.joinedTo}
                    onChange={(val) => onFiltersChange({ ...filters, joinedTo: val })}
                  />
                </div>
              </div>

              {/* DOB Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date of Birth</Label>
                <div className="grid grid-cols-2 gap-2">
                  <SmartDateInput
                    placeholder="From"
                    value={filters.dobFrom}
                    onChange={(val) => onFiltersChange({ ...filters, dobFrom: val })}
                  />
                  <SmartDateInput
                    placeholder="To"
                    value={filters.dobTo}
                    onChange={(val) => onFiltersChange({ ...filters, dobTo: val })}
                  />
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={filters.noActiveMembership ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleQuickFilter("no-membership")}
        >
          No Active Membership
          {filters.noActiveMembership && <X className="ml-1 h-3 w-3" />}
        </Badge>
        <Badge 
          variant={filters.expiringWithinDays ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleQuickFilter("expiring-soon")}
        >
          Expiring Soon (7 days)
          {filters.expiringWithinDays && <X className="ml-1 h-3 w-3" />}
        </Badge>

        {/* Active filter badges */}
        {filters.joinedFrom && (
          <Badge variant="secondary">
            Joined from: {filters.joinedFrom}
            <X 
              className="ml-1 h-3 w-3 cursor-pointer" 
              onClick={() => onFiltersChange({ ...filters, joinedFrom: "" })}
            />
          </Badge>
        )}
        {filters.joinedTo && (
          <Badge variant="secondary">
            Joined to: {filters.joinedTo}
            <X 
              className="ml-1 h-3 w-3 cursor-pointer" 
              onClick={() => onFiltersChange({ ...filters, joinedTo: "" })}
            />
          </Badge>
        )}
        {filters.dobFrom && (
          <Badge variant="secondary">
            DOB from: {filters.dobFrom}
            <X 
              className="ml-1 h-3 w-3 cursor-pointer" 
              onClick={() => onFiltersChange({ ...filters, dobFrom: "" })}
            />
          </Badge>
        )}
        {filters.dobTo && (
          <Badge variant="secondary">
            DOB to: {filters.dobTo}
            <X 
              className="ml-1 h-3 w-3 cursor-pointer" 
              onClick={() => onFiltersChange({ ...filters, dobTo: "" })}
            />
          </Badge>
        )}
      </div>
    </div>
  );
}
