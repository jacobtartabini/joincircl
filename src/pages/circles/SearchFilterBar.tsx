
import { useState, useEffect } from "react";
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
  };

  // Get total filters count
  const totalFiltersCount = FILTER_KEYS.reduce(
    (count, key) => count + (Array.isArray(safeSelectedFilters[key]) ? safeSelectedFilters[key].length : 0), 
    0
  );

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex ${isMobile ? "flex-col" : "items-center"} gap-3`}>
        <SearchInput 
          searchQuery={searchQuery} 
          onSearchChange={onSearchChange} 
        />

        <div className="flex gap-2 flex-wrap">
          <FilterPopover
            allOptions={allOptions}
            selectedFilters={safeSelectedFilters}
            onSelect={handleSelect}
            onClearAll={handleClearAll}
            totalFiltersCount={totalFiltersCount}
          />
          <CircleImportButtons onImportSuccess={onRefresh} />
        </div>
      </div>

      <FilterBadges
        selectedFilters={safeSelectedFilters}
        onRemoveFilter={handleRemove}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
