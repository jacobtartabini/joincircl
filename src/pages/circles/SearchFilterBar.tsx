import { useState, useEffect, useMemo } from "react";
import { SearchInput } from "./components/SearchInput";
import { FilterBadges } from "./components/FilterBadges";
import { FilterPopover } from "./components/FilterPopover";
import CircleImportButtons from "@/components/circles/CircleImportButtons";
import { useIsMobile } from "@/hooks/use-mobile";
import { Contact } from "@/types/contact";

// Define filter keys but exclude tags
const FILTER_KEYS = ["locations", "companies", "industries"] as const;
type FilterKey = typeof FILTER_KEYS[number];

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
  const isMobile = useIsMobile();

  // Ensure we're working with a valid contacts array
  const safeContacts = useMemo(() => 
    Array.isArray(contacts) ? contacts.filter(Boolean) : []
  , [contacts]);

  // Initialize filterOptions state with empty arrays to prevent undefined errors
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
    if (!Array.isArray(safeContacts) || safeContacts.length === 0) {
      return;
    }

    try {
      const uniqueLocations = new Set<string>();
      const uniqueCompanies = new Set<string>();
      const uniqueIndustries = new Set<string>();

      safeContacts.forEach(contact => {
        if (contact && typeof contact.location === 'string' && contact.location.trim()) 
          uniqueLocations.add(contact.location);
          
        if (contact && typeof contact.company_name === 'string' && contact.company_name.trim()) 
          uniqueCompanies.add(contact.company_name);
          
        if (contact && typeof contact.industry === 'string' && contact.industry.trim()) 
          uniqueIndustries.add(contact.industry);
      });

      setFilterOptions({
        locations: Array.from(uniqueLocations).filter(Boolean).sort(),
        companies: Array.from(uniqueCompanies).filter(Boolean).sort(),
        industries: Array.from(uniqueIndustries).filter(Boolean).sort(),
      });
    } catch (error) {
      console.error("Error extracting filter options:", error);
      // In case of error, ensure we have empty arrays instead of undefined
      setFilterOptions({
        locations: [],
        companies: [],
        industries: []
      });
    }
  }, [safeContacts]);

  // Make sure all options are arrays and never undefined
  const allOptions = useMemo(() => ({
    locations: Array.isArray(filterOptions.locations) ? filterOptions.locations : 
      (Array.isArray(allLocations) ? allLocations.filter(Boolean) : []),
    companies: Array.isArray(filterOptions.companies) ? filterOptions.companies : 
      (Array.isArray(allCompanies) ? allCompanies.filter(Boolean) : []),
    industries: Array.isArray(filterOptions.industries) ? filterOptions.industries : 
      (Array.isArray(allIndustries) ? allIndustries.filter(Boolean) : []),
  }), [filterOptions, allLocations, allCompanies, allIndustries]);

  // Ensure selectedFilters is properly defined with default values
  const safeSelectedFilters = useMemo(() => ({
    tags: Array.isArray(selectedFilters?.tags) ? selectedFilters.tags.filter(Boolean) : [],
    locations: Array.isArray(selectedFilters?.locations) ? selectedFilters.locations.filter(Boolean) : [],
    companies: Array.isArray(selectedFilters?.companies) ? selectedFilters.companies.filter(Boolean) : [],
    industries: Array.isArray(selectedFilters?.industries) ? selectedFilters.industries.filter(Boolean) : [],
  }), [selectedFilters]);

  // Get total filters count
  const totalFiltersCount = useMemo(() => 
    FILTER_KEYS.reduce(
      (count, key) => count + (Array.isArray(safeSelectedFilters[key]) ? safeSelectedFilters[key].length : 0), 
      0
    )
  , [safeSelectedFilters]);

  // Ensure we never pass undefined values to child components
  const safeProps = useMemo(() => ({
    allOptions: {
      locations: Array.isArray(allOptions.locations) ? allOptions.locations : [],
      companies: Array.isArray(allOptions.companies) ? allOptions.companies : [],
      industries: Array.isArray(allOptions.industries) ? allOptions.industries : [],
    },
    selectedFilters: safeSelectedFilters,
    totalFiltersCount,
    searchQuery: typeof searchQuery === 'string' ? searchQuery : '',
  }), [allOptions, safeSelectedFilters, totalFiltersCount, searchQuery]);

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex ${isMobile ? "flex-col" : "items-center"} gap-3`}>
        <SearchInput 
          searchQuery={safeProps.searchQuery} 
          onSearchChange={onSearchChange} 
        />

        <div className="flex gap-2 flex-wrap">
          <FilterPopover
            allOptions={safeProps.allOptions}
            selectedFilters={safeProps.selectedFilters}
            onSelect={handleSelect}
            onClearAll={handleClearAll}
            totalFiltersCount={safeProps.totalFiltersCount}
          />
          <CircleImportButtons onImportSuccess={onRefresh} />
        </div>
      </div>

      <FilterBadges
        selectedFilters={safeProps.selectedFilters}
        onRemoveFilter={handleRemove}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
