
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar, MultiSelect, FilterOption } from "@/components/ui/search-filter";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface SearchFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: FilterOption[];
}

export const SearchFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  availableTags
}: SearchFilterBarProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
      <SearchBar 
        onSearch={setSearchQuery} 
        placeholder="Search contacts..." 
      />
      <FiltersPopover
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
      />
    </div>
  );
};

interface FiltersPopoverProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: FilterOption[];
}

const FiltersPopover = ({
  selectedTags,
  setSelectedTags,
  availableTags
}: FiltersPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          <Filter size={16} />
          <span className="hidden md:inline">Filters</span>
          {selectedTags.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
              {selectedTags.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Filter by tags</h4>
          <MultiSelect
            options={availableTags}
            selected={selectedTags}
            onChange={setSelectedTags}
            placeholder="Select tags..."
          />
          {selectedTags.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedTags([])} 
              className="text-sm text-muted-foreground"
            >
              Clear filters
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
