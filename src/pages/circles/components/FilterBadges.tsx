
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Define filter keys but exclude tags
const FILTER_KEYS = ["locations", "companies", "industries"] as const;
type FilterKey = typeof FILTER_KEYS[number];

interface FilterBadgesProps {
  selectedFilters: {
    tags: string[];
    locations: string[];
    companies: string[];
    industries: string[];
  };
  onRemoveFilter: (key: FilterKey, value: string) => void;
  onClearAll: () => void;
}

export const FilterBadges = ({ 
  selectedFilters,
  onRemoveFilter,
  onClearAll
}: FilterBadgesProps) => {
  // Ensure selectedFilters is properly defined with default values
  const safeSelectedFilters = {
    tags: Array.isArray(selectedFilters?.tags) ? selectedFilters.tags.filter(Boolean) : [],
    locations: Array.isArray(selectedFilters?.locations) ? selectedFilters.locations.filter(Boolean) : [],
    companies: Array.isArray(selectedFilters?.companies) ? selectedFilters.companies.filter(Boolean) : [],
    industries: Array.isArray(selectedFilters?.industries) ? selectedFilters.industries.filter(Boolean) : [],
  };

  // Get total filters count
  const totalFiltersCount = FILTER_KEYS.reduce(
    (count, key) => count + (Array.isArray(safeSelectedFilters[key]) ? safeSelectedFilters[key].length : 0), 
    0
  );

  if (totalFiltersCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_KEYS.map((key) =>
        // Ensure we have a valid array to map over
        (Array.isArray(safeSelectedFilters[key]) ? safeSelectedFilters[key] : [])
          .filter(Boolean)
          .map((value, index) => (
            <Badge 
              key={`selected-${key}-${value || ''}-${index}`}
              variant="secondary" 
              size="small"
              className="cursor-pointer hover:ring-secondary/50"
            >
              {value}
              <X 
                className="h-3 w-3 cursor-pointer ml-1" 
                onClick={() => onRemoveFilter(key, value)} 
              />
            </Badge>
          ))
      )}
      {(totalFiltersCount > 0) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground"
          onClick={onClearAll}
        >
          Clear All
        </Button>
      )}
    </div>
  );
};
