
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import CircleImportButtons from "@/components/circles/CircleImportButtons";
import { useIsMobile } from "@/hooks/use-mobile";
import { Contact } from "@/types/contact";

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
  contacts?: Contact[]; // Add contacts prop to get filter data
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
  contacts = [], // Default to empty array
}: SearchFilterBarProps) {
  const [openFilters, setOpenFilters] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<FilterKey>("locations");
  const isMobile = useIsMobile();

  // Extract unique values from contacts
  const [filterOptions, setFilterOptions] = useState({
    locations: [] as string[],
    companies: [] as string[],
    industries: [] as string[],
  });

  // Extract unique values from contacts
  useEffect(() => {
    if (!contacts || contacts.length === 0) return;

    const uniqueLocations = new Set<string>();
    const uniqueCompanies = new Set<string>();
    const uniqueIndustries = new Set<string>();

    contacts.forEach(contact => {
      if (contact.location) uniqueLocations.add(contact.location);
      if (contact.company_name) uniqueCompanies.add(contact.company_name);
      if (contact.industry) uniqueIndustries.add(contact.industry);
    });

    setFilterOptions({
      locations: Array.from(uniqueLocations).filter(Boolean).sort(),
      companies: Array.from(uniqueCompanies).filter(Boolean).sort(),
      industries: Array.from(uniqueIndustries).filter(Boolean).sort(),
    });
  }, [contacts]);

  // Make sure all options are arrays and never undefined
  const allOptions = {
    locations: filterOptions.locations.length > 0 ? filterOptions.locations : (Array.isArray(allLocations) ? allLocations.filter(Boolean) : []),
    companies: filterOptions.companies.length > 0 ? filterOptions.companies : (Array.isArray(allCompanies) ? allCompanies.filter(Boolean) : []),
    industries: filterOptions.industries.length > 0 ? filterOptions.industries : (Array.isArray(allIndustries) ? allIndustries.filter(Boolean) : []),
  };

  // Ensure selectedFilters is properly defined with default values (excluding tags)
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
    (count, key) => count + (Array.isArray(safeSelectedFilters[key]) ? safeSelectedFilters[key].length : 0), 
    0
  );

  // Create a guaranteed unique id for each CommandItem in popover groups
  const createUniqueId = (prefix: string, optionValue: string | undefined, index: number) => {
    return `${prefix}-${optionValue || index}-${Math.random().toString(36).substring(2, 5)}`;
  };

  // Get label for currently active filter tab
  const getActiveFilterLabel = () => {
    const key = activeFilterTab.charAt(0).toUpperCase() + activeFilterTab.slice(1);
    return key.endsWith('ies') ? key.slice(0, -3) + 'y' : key.slice(0, -1);
  };

  // Ensure safe arrays for options - this is crucial
  const getCurrentFilterOptions = () => {
    const options = allOptions[activeFilterTab] || [];
    // Make absolutely sure we have an array that is not undefined
    return Array.isArray(options) ? options : [];
  };

  // Ensure we have valid array for selected items
  const getCurrentSelectedFilters = () => {
    const selected = safeSelectedFilters[activeFilterTab];
    return Array.isArray(selected) ? selected : [];
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
            <PopoverContent className="w-72 p-0 rounded-xl shadow-lg border border-gray-100" align="start" sideOffset={4}>
              <div className="border-b border-border flex p-1">
                {FILTER_KEYS.map((key) => (
                  <Button
                    key={key}
                    variant={activeFilterTab === key ? "default" : "ghost"}
                    size="sm"
                    className={`flex-1 rounded-md h-9 text-xs ${activeFilterTab === key ? 'shadow-sm' : ''}`}
                    onClick={() => setActiveFilterTab(key)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {safeSelectedFilters[key].length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-foreground text-primary text-[10px] font-medium">
                        {safeSelectedFilters[key].length}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
              <Command className="p-2">
                <CommandInput 
                  placeholder={`Search ${activeFilterTab}...`} 
                  className="h-9 rounded-lg border border-input"
                />
                <div className="pt-2 pb-1 text-xs font-medium text-muted-foreground px-2">
                  {getCurrentFilterOptions().length === 0 
                    ? `No ${getActiveFilterLabel()} found` 
                    : `Select ${getActiveFilterLabel()}`}
                </div>
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  No {activeFilterTab} found.
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {/* This is the key fix: ensure we have a valid array to map over */}
                  {getCurrentFilterOptions()
                    .filter(option => option && !getCurrentSelectedFilters().includes(option))
                    .map((option, index) => {
                      if (!option) return null; // Skip nulls
                      
                      const optionValue = option || `unnamed-${activeFilterTab}-${index}`;
                      const displayText = option || `Unnamed ${getActiveFilterLabel()} ${index + 1}`;
                      const uniqueId = createUniqueId(activeFilterTab, option, index);
                      
                      return (
                        <CommandItem 
                          key={uniqueId}
                          value={optionValue}
                          onSelect={() => handleSelect(activeFilterTab, optionValue)}
                          className="rounded-md cursor-pointer"
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
                    className="w-full text-xs text-muted-foreground hover:bg-muted/50"
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
          // Ensure we have a valid array to map over
          (Array.isArray(safeSelectedFilters[key]) ? safeSelectedFilters[key] : [])
            .filter(Boolean)
            .map((value, index) => {
              const displayText = value || `Unnamed ${key.slice(0, -1)} ${index + 1}`;
              const uniqueKey = `selected-${key}-${value || ''}-${index}`;
              
              return (
                <Badge 
                  key={uniqueKey}
                  variant="secondary" 
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/80 hover:bg-muted"
                >
                  {displayText}
                  <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleRemove(key, value)} />
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
