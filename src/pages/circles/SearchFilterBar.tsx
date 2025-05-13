
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

// Define filter keys but exclude tags
const FILTER_KEYS = ["locations", "companies", "industries"] as const;
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
  const [openFilters, setOpenFilters] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<FilterKey>("locations");
  const isMobile = useIsMobile();

  // Make sure all options are arrays and never undefined
  const allOptions = {
    locations: Array.isArray(allLocations) ? allLocations.filter(Boolean) : [],
    companies: Array.isArray(allCompanies) ? allCompanies.filter(Boolean) : [],
    industries: Array.isArray(allIndustries) ? allIndustries.filter(Boolean) : [],
  };

  // Ensure selectedFilters is properly defined with default values (excluding tags)
  const safeSelectedFilters = {
    tags: [], // Keep this for compatibility but we won't use it
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
      tags: [], // Keep empty tags array for compatibility
      locations: [],
      companies: [],
      industries: [],
    });
    setOpenFilters(false);
  };

  // Get total filters count
  const totalFiltersCount = FILTER_KEYS.reduce(
    (count, key) => count + safeSelectedFilters[key].length, 0
  );

  // Create a guaranteed unique id for each CommandItem in popover groups
  const createUniqueId = (prefix: string, optionValue: string | undefined, index: number) => {
    return `${prefix}-${optionValue || index}-${Math.random().toString(36).substring(2, 5)}`;
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
          {/* Single combined filter button with badge */}
          <Popover open={openFilters} onOpenChange={setOpenFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4" />
                {totalFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {totalFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0" align="start" sideOffset={4}>
              <div className="border-b border-border flex">
                {FILTER_KEYS.map((key) => (
                  <Button
                    key={key}
                    variant={activeFilterTab === key ? "default" : "ghost"}
                    size="sm"
                    className="flex-1 rounded-none h-9 text-xs"
                    onClick={() => setActiveFilterTab(key)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {safeSelectedFilters[key].length > 0 && (
                      <span className="ml-1 px-1 rounded-full bg-muted text-[10px]">
                        {safeSelectedFilters[key].length}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
              <Command>
                <CommandInput placeholder={`Search ${activeFilterTab}...`} />
                <CommandEmpty>No {activeFilterTab} found.</CommandEmpty>
                <CommandGroup>
                  {allOptions[activeFilterTab]
                    .filter(option => option && !safeSelectedFilters[activeFilterTab].includes(option))
                    .map((option, index) => {
                      const optionValue = option || `unnamed-${activeFilterTab}-${index}`;
                      const displayText = option || `Unnamed ${activeFilterTab.slice(0, -1)} ${index + 1}`;
                      
                      return (
                        <CommandItem 
                          key={createUniqueId(activeFilterTab, option, index)}
                          value={optionValue}
                          onSelect={() => handleSelect(activeFilterTab, optionValue)}
                        >
                          {displayText}
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              </Command>
              {totalFiltersCount > 0 && (
                <div className="p-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground"
                    onClick={handleClearAll}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <CircleImportButtons onImportSuccess={onRefresh} />
        </div>
      </div>

      {/* Selected filter badges */}
      <div className="flex flex-wrap gap-2">
        {FILTER_KEYS.map((key) =>
          safeSelectedFilters[key].filter(Boolean).map((value, index) => {
            const displayText = value || `Unnamed ${key.slice(0, -1)} ${index + 1}`;
            
            return (
              <Badge 
                key={`selected-${key}-${value || ''}-${index}`}
                variant="secondary" 
                className="flex items-center gap-1"
              >
                {displayText}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemove(key, value)} />
              </Badge>
            );
          })
        )}
        {(totalFiltersCount > 0) && (
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
