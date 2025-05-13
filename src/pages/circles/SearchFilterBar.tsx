
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import CircleImportButtons from "@/components/circles/CircleImportButtons";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchFilterBarProps {
  allTags?: string[];
  allLocations?: string[];
  allCompanies?: string[];
  allIndustries?: string[];
  selectedFilters: {
    tags: string[];
    locations: string[];
    companies: string[];
    industries: string[];
  };
  onFiltersChange: (filters: SearchFilterBarProps["selectedFilters"]) => void;
  onAddContact: () => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FILTER_KEYS = ["tags", "locations", "companies", "industries"] as const;
type FilterKey = typeof FILTER_KEYS[number];

export default function SearchFilterBar({
  allTags = [],
  allLocations = [],
  allCompanies = [],
  allIndustries = [],
  selectedFilters = {
    tags: [],
    locations: [],
    companies: [],
    industries: [],
  },
  onFiltersChange,
  onAddContact,
  onRefresh,
  searchQuery = "",
  onSearchChange,
}: SearchFilterBarProps) {
  const [openPopover, setOpenPopover] = useState<FilterKey | null>(null);
  const isMobile = useIsMobile();

  // Make sure all options are arrays and never undefined
  const allOptions = {
    tags: Array.isArray(allTags) ? allTags.filter(Boolean) : [],
    locations: Array.isArray(allLocations) ? allLocations.filter(Boolean) : [],
    companies: Array.isArray(allCompanies) ? allCompanies.filter(Boolean) : [],
    industries: Array.isArray(allIndustries) ? allIndustries.filter(Boolean) : [],
  };

  // Ensure selectedFilters is properly defined with default values
  const safeSelectedFilters = {
    tags: Array.isArray(selectedFilters?.tags) ? selectedFilters.tags.filter(Boolean) : [],
    locations: Array.isArray(selectedFilters?.locations) ? selectedFilters.locations.filter(Boolean) : [],
    companies: Array.isArray(selectedFilters?.companies) ? selectedFilters.companies.filter(Boolean) : [],
    industries: Array.isArray(selectedFilters?.industries) ? selectedFilters.industries.filter(Boolean) : [],
  };

  const handleSelect = (key: FilterKey, value: string) => {
    if (!value) return; // Skip empty values
    
    if (!safeSelectedFilters[key].includes(value)) {
      onFiltersChange({
        ...safeSelectedFilters,
        [key]: [...safeSelectedFilters[key], value],
      });
    }
    setOpenPopover(null);
  };

  const handleRemove = (key: FilterKey, value: string) => {
    if (!value) return; // Skip empty values
    
    onFiltersChange({
      ...safeSelectedFilters,
      [key]: safeSelectedFilters[key].filter((v) => v !== value),
    });
  };

  const handleClearAll = () => {
    onFiltersChange({
      tags: [],
      locations: [],
      companies: [],
      industries: [],
    });
  };

  // Create a guaranteed unique id for each CommandItem in popover groups
  const createUniqueId = (prefix: string, optionValue: string, index: number) => {
    return `${prefix}-${optionValue || index}-${index}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex ${isMobile ? "flex-col" : "items-center"} gap-3`}>
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-8 h-10"
            value={searchQuery || ""}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTER_KEYS.map((key) => (
            <Popover key={key} open={openPopover === key} onOpenChange={(open) => setOpenPopover(open ? key : null)}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <Filter className="ml-1 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0" align="start" sideOffset={4}>
                <Command>
                  <CommandInput placeholder={`Search ${key}...`} />
                  <CommandEmpty>No {key} found.</CommandEmpty>
                  <CommandGroup className="overflow-auto max-h-64">
                    {allOptions[key]
                      .filter(option => option && !safeSelectedFilters[key].includes(option))
                      .map((option, index) => (
                        <CommandItem 
                          key={createUniqueId(key, option || "", index)}
                          value={option || `option-${key}-${index}`}
                          onSelect={() => handleSelect(key, option || "")}
                        >
                          {option || `Unnamed ${key.slice(0, -1)}`}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          ))}
          <CircleImportButtons onImportSuccess={onRefresh} />
        </div>
      </div>

      {/* Selected filter badges */}
      <div className="flex flex-wrap gap-2">
        {FILTER_KEYS.map((key) =>
          safeSelectedFilters[key].filter(Boolean).map((value, index) => (
            <Badge 
              key={`selected-${key}-${value || index}-${index}`} 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              {value || `Unnamed ${key.slice(0, -1)}`}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemove(key, value)} />
            </Badge>
          ))
        )}
        {(FILTER_KEYS.some((key) => safeSelectedFilters[key].length > 0)) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
