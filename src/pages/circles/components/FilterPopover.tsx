
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useIsMobile } from "@/hooks/use-mobile";

// Define filter keys but exclude tags
const FILTER_KEYS = ["locations", "companies", "industries"] as const;
type FilterKey = typeof FILTER_KEYS[number];

interface FilterPopoverProps {
  allOptions: {
    locations: string[];
    companies: string[];
    industries: string[];
  };
  selectedFilters: {
    tags: string[];
    locations: string[];
    companies: string[];
    industries: string[];
  };
  onSelect: (key: FilterKey, value: string) => void;
  onClearAll: () => void;
  totalFiltersCount: number;
}

export const FilterPopover = ({
  allOptions,
  selectedFilters,
  onSelect,
  onClearAll,
  totalFiltersCount = 0
}: FilterPopoverProps) => {
  const [openFilters, setOpenFilters] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<FilterKey>("locations");
  const isMobile = useIsMobile();

  // Ensure selectedFilters is properly defined with default values
  const safeSelectedFilters = useMemo(() => ({
    tags: Array.isArray(selectedFilters?.tags) ? selectedFilters.tags.filter(Boolean) : [],
    locations: Array.isArray(selectedFilters?.locations) ? selectedFilters.locations.filter(Boolean) : [],
    companies: Array.isArray(selectedFilters?.companies) ? selectedFilters.companies.filter(Boolean) : [],
    industries: Array.isArray(selectedFilters?.industries) ? selectedFilters.industries.filter(Boolean) : [],
  }), [selectedFilters]);

  // Initialize safe versions of options to avoid undefined iterations
  const safeOptions = useMemo(() => ({
    locations: Array.isArray(allOptions?.locations) ? allOptions.locations.filter(Boolean) : [],
    companies: Array.isArray(allOptions?.companies) ? allOptions.companies.filter(Boolean) : [],
    industries: Array.isArray(allOptions?.industries) ? allOptions.industries.filter(Boolean) : []
  }), [allOptions]);

  // Get label for currently active filter tab
  const getActiveFilterLabel = () => {
    const key = activeFilterTab.charAt(0).toUpperCase() + activeFilterTab.slice(1);
    return key.endsWith('ies') ? key.slice(0, -3) + 'y' : key.slice(0, -1);
  };

  // Get current filter options as a safe array
  const getCurrentFilterOptions = (): string[] => {
    // Make sure safeOptions is defined and has the activeFilterTab property
    if (!safeOptions || !safeOptions[activeFilterTab]) {
      return [];
    }
    return safeOptions[activeFilterTab];
  };

  // Get current selected filters as a safe array
  const getCurrentSelectedFilters = (): string[] => {
    return safeSelectedFilters[activeFilterTab];
  };

  // Pre-calculate options for efficiency and safety
  const currentOptions = useMemo(() => getCurrentFilterOptions(), [activeFilterTab, safeOptions]);
  const currentSelected = useMemo(() => getCurrentSelectedFilters(), [activeFilterTab, safeSelectedFilters]);
  
  // Safely calculate available options (not already selected)
  const availableOptions = useMemo(() => {
    if (!Array.isArray(currentOptions)) return [];
    if (!Array.isArray(currentSelected)) return currentOptions;
    
    return currentOptions.filter(option => 
      option && !currentSelected.includes(option)
    );
  }, [currentOptions, currentSelected]);

  // Check if there are any options to display
  const hasOptions = useMemo(() => 
    Array.isArray(availableOptions) && availableOptions.length > 0
  , [availableOptions]);

  return (
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
            {currentOptions.length === 0 
              ? `No ${getActiveFilterLabel()} found` 
              : `Select ${getActiveFilterLabel()}`}
          </div>
          
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No {activeFilterTab} found.
          </CommandEmpty>

          {hasOptions ? (
            <CommandGroup>
              {availableOptions.map((option, index) => {
                if (!option) return null; // Skip null/undefined items
                
                const safeOption = String(option); // Ensure option is a string
                const itemKey = `filter-item-${activeFilterTab}-${safeOption}-${index}`;
                
                return (
                  <CommandItem 
                    key={itemKey}
                    value={safeOption}
                    onSelect={() => onSelect(activeFilterTab, safeOption)}
                    className="rounded-md cursor-pointer"
                  >
                    {safeOption}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : (
            <div className="text-xs text-center py-6 text-muted-foreground">
              {currentOptions.length === 0 
                ? `No ${activeFilterTab} available` 
                : `All ${activeFilterTab} are selected`}
            </div>
          )}
        </Command>
        {totalFiltersCount > 0 && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:bg-muted/50"
              onClick={() => {
                onClearAll();
                setOpenFilters(false);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
