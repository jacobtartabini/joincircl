
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

  // Ensure we're working with a valid contacts array
  const safeContacts = Array.isArray(contacts) ? contacts.filter(Boolean) : [];

  // Extract unique values from contacts
  const [filterOptions, setFilterOptions] = useState<{
    locations: string[];
    companies: string[];
    industries: string[];
  }>({
    locations: [],
    companies: [],
    industries: [],
  });

  // Extract unique values from contacts
  useEffect(() => {
    if (!safeContacts || !Array.isArray(safeContacts) || !safeContacts.length) {
      setFilterOptions({
        locations: [],
        companies: [],
        industries: []
      });
      return;
    }

    try {
      const uniqueLocations = new Set<string>();
      const uniqueCompanies = new Set<string>();
      const uniqueIndustries = new Set<string>();

      safeContacts.forEach(contact => {
        if (contact && contact.location) uniqueLocations.add(contact.location);
        if (contact && contact.company_name) uniqueCompanies.add(contact.company_name);
        if (contact && contact.industry) uniqueIndustries.add(contact.industry);
      });

      setFilterOptions({
        locations: Array.from(uniqueLocations).filter(Boolean).sort(),
        companies: Array.from(uniqueCompanies).filter(Boolean).sort(),
        industries: Array.from(uniqueIndustries).filter(Boolean).sort(),
      });
    } catch (error) {
      console.error("Error extracting filter options:", error);
      setFilterOptions({
        locations: [],
        companies: [],
        industries: []
      });
    }
  }, [safeContacts]);

  // Make sure all options are arrays and never undefined
  const allOptions = {
    locations: Array.isArray(filterOptions.locations) && filterOptions.locations.length > 0 
      ? filterOptions.locations 
      : (Array.isArray(allLocations) ? allLocations.filter(Boolean) : []),
    companies: Array.isArray(filterOptions.companies) && filterOptions.companies.length > 0 
      ? filterOptions.companies 
      : (Array.isArray(allCompanies) ? allCompanies.filter(Boolean) : []),
    industries: Array.isArray(filterOptions.industries) && filterOptions.industries.length > 0 
      ? filterOptions.industries 
      : (Array.isArray(allIndustries) ? allIndustries.filter(Boolean) : []),
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

  // Get current filter options as a safe array
  const getCurrentFilterOptions = (): string[] => {
    const options = allOptions[activeFilterTab];
    return Array.isArray(options) ? options : [];
  };

  // Get current selected filters as a safe array
  const getCurrentSelectedFilters = (): string[] => {
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
                  {(() => {
                    try {
                      const options = getCurrentFilterOptions();
                      const selected = getCurrentSelectedFilters();
                      
                      if (!Array.isArray(options) || options.length === 0) {
                        return (
                          <div className="text-xs text-center py-2 text-muted-foreground">
                            No {activeFilterTab} available
                          </div>
                        );
                      }

                      // Filter out options that are already selected and ensure each item is valid
                      const availableOptions = options
                        .filter(Boolean)
                        .filter(option => !selected.includes(option));
                      
                      if (availableOptions.length === 0) {
                        return (
                          <div className="text-xs text-center py-2 text-muted-foreground">
                            All {activeFilterTab} are selected
                          </div>
                        );
                      }
                      
                      return availableOptions.map((option, index) => (
                        <CommandItem 
                          key={createUniqueId(activeFilterTab, option, index)}
                          value={option}
                          onSelect={() => handleSelect(activeFilterTab, option)}
                          className="rounded-md cursor-pointer"
                        >
                          {option}
                        </CommandItem>
                      ));
                    } catch (err) {
                      console.error("Error rendering command items:", err);
                      return (
                        <div className="text-xs text-center py-2 text-muted-foreground">
                          Error loading filter options
                        </div>
                      );
                    }
                  })()}
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
            .map((value, index) => (
              <Badge 
                key={`selected-${key}-${value || ''}-${index}`}
                variant="secondary" 
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/80 hover:bg-muted"
              >
                {value}
                <X 
                  className="h-3 w-3 cursor-pointer ml-1" 
                  onClick={() => handleRemove(key, value)} 
                />
              </Badge>
            ))
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
