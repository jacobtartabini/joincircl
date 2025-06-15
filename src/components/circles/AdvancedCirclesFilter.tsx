
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ListFilter, Search, Plus, FileUp } from "lucide-react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Contact } from "@/types/contact";
import Filters, {
  AnimateChangeInHeight,
  Filter,
  FilterOperator,
  FilterOption,
  FilterType,
  filterViewOptions,
  circleFilterOptions,
  dateFilterOptions,
  DateRange,
} from "@/components/ui/filters";
import ImportContactsDialog from "./ImportContactsDialog";

interface AdvancedCirclesFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddContact: () => void;
  contacts: Contact[];
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  refetchContacts: () => void;
}

export function AdvancedCirclesFilter({
  searchQuery,
  onSearchChange,
  onAddContact,
  contacts,
  filters,
  onFiltersChange,
  refetchContacts,
}: AdvancedCirclesFilterProps) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<FilterType | null>(null);
  const [commandInput, setCommandInput] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  // Generate dynamic filter options based on existing contact data
  const filterOptions = useMemo(() => {
    const companies = Array.from(
      new Set(
        contacts
          .map((c) => c.company_name)
          .filter(Boolean)
          .map((name) => name!)
      )
    ).map((name) => ({
      name,
      icon: undefined,
    }));

    const tags = Array.from(
      new Set(contacts.flatMap((c) => c.tags || []))
    ).map((tag) => ({
      name: tag,
      icon: undefined,
    }));

    const industries = Array.from(
      new Set(
        contacts
          .map((c) => c.industry)
          .filter(Boolean)
          .map((industry) => industry!)
      )
    ).map((industry) => ({
      name: industry,
      icon: undefined,
    }));

    const universities = Array.from(
      new Set(
        contacts
          .map((c) => c.university)
          .filter(Boolean)
          .map((university) => university!)
      )
    ).map((university) => ({
      name: university,
      icon: undefined,
    }));

    const locations = Array.from(
      new Set(
        contacts
          .map((c) => c.location)
          .filter(Boolean)
          .map((location) => location!)
      )
    ).map((location) => ({
      name: location,
      icon: undefined,
    }));

    return {
      [FilterType.CIRCLE]: circleFilterOptions,
      [FilterType.COMPANY]: companies,
      [FilterType.TAGS]: tags,
      [FilterType.INDUSTRY]: industries,
      [FilterType.UNIVERSITY]: universities,
      [FilterType.LOCATION]: locations,
      [FilterType.LAST_CONTACT]: dateFilterOptions,
      [FilterType.CREATED_DATE]: dateFilterOptions,
      [FilterType.UPDATED_DATE]: dateFilterOptions,
    };
  }, [contacts]);

  const activeFiltersCount = filters.filter((filter) => filter.value?.length > 0).length;

  return (
    <div className="flex items-center gap-3">
      {/* Search - Takes most space */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0daeec] dark:focus:border-[#0daeec] transition-colors rounded-full text-sm"
        />
      </div>

      {/* Advanced Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filters 
          filters={filters} 
          setFilters={onFiltersChange} 
          filterOptions={filterOptions}
        />
        
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="transition group h-8 text-xs items-center rounded-full border-gray-200 hover:border-red-200 hover:text-red-600"
            onClick={() => onFiltersChange([])}
          >
            Clear All
          </Button>
        )}

        <Popover
          open={filterPopoverOpen}
          onOpenChange={(open) => {
            setFilterPopoverOpen(open);
            if (!open) {
              setTimeout(() => {
                setSelectedView(null);
                setCommandInput("");
              }, 200);
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition group h-8 text-xs items-center rounded-full flex gap-1.5 items-center border border-gray-200 hover:border-[#0daeec] hover:bg-[#0daeec]/5",
                activeFiltersCount > 0 && "w-8 px-2"
              )}
            >
              <ListFilter className="size-3 shrink-0 transition-all text-gray-500 group-hover:text-[#0daeec]" />
              {activeFiltersCount === 0 && "Filter"}
              {activeFiltersCount > 0 && (
                <span className="bg-[#0daeec] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
            <AnimateChangeInHeight>
              <Command>
                <CommandInput
                  placeholder={selectedView ? selectedView : "Filter..."}
                  className="h-9 text-sm"
                  value={commandInput}
                  onInputCapture={(e) => {
                    setCommandInput(e.currentTarget.value);
                  }}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  {selectedView ? (
                    <CommandGroup>
                      {filterOptions[selectedView]?.map((filter: FilterOption) => (
                        <CommandItem
                          className="group text-gray-600 dark:text-gray-300 flex gap-2 items-center text-sm hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          key={filter.name as string}
                          value={filter.name as string}
                          onSelect={(currentValue) => {
                            onFiltersChange([
                              ...filters,
                              {
                                id: nanoid(),
                                type: selectedView,
                                operator:
                                  selectedView === FilterType.LAST_CONTACT &&
                                  currentValue !== DateRange.IN_THE_PAST
                                    ? FilterOperator.BEFORE
                                    : FilterOperator.IS,
                                value: [currentValue],
                              },
                            ]);
                            setTimeout(() => {
                              setSelectedView(null);
                              setCommandInput("");
                            }, 200);
                            setFilterPopoverOpen(false);
                          }}
                        >
                          {filter.icon}
                          <span className="text-gray-700 dark:text-gray-200">
                            {filter.label || filter.name}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : (
                    filterViewOptions.map((group: FilterOption[], index: number) => (
                      <div key={index}>
                        <CommandGroup>
                          {group.map((filter: FilterOption) => (
                            <CommandItem
                              className="group text-gray-600 dark:text-gray-300 flex gap-2 items-center text-sm hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                              key={filter.name as string}
                              value={filter.name as string}
                              onSelect={(currentValue) => {
                                setSelectedView(currentValue as FilterType);
                                setCommandInput("");
                              }}
                            >
                              {filter.icon}
                              <span className="text-gray-700 dark:text-gray-200">
                                {filter.name}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {index < filterViewOptions.length - 1 && (
                          <CommandSeparator className="bg-gray-100 dark:bg-gray-800" />
                        )}
                      </div>
                    ))
                  )}
                </CommandList>
              </Command>
            </AnimateChangeInHeight>
          </PopoverContent>
        </Popover>
      </div>

      {/* Import Contacts Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3 flex items-center gap-2 rounded-full border-gray-200 hover:border-[#0daeec] hover:bg-[#0daeec]/5 transition-colors"
        onClick={() => setImportOpen(true)}
      >
        <FileUp className="h-3 w-3" />
        <span className="text-xs font-medium">Import</span>
      </Button>

      {/* Add Contact Button */}
      <Button
        onClick={onAddContact}
        size="sm"
        className="h-8 px-3 text-white transition-colors rounded-full bg-[#0daeec] hover:bg-[#0daeec]/90"
      >
        <Plus className="h-3 w-3 mr-2" />
        <span className="text-xs font-medium">Add</span>
      </Button>

      {/* Import Dialog */}
      <ImportContactsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportSuccess={() => {}}
        refetchContacts={refetchContacts}
      />
    </div>
  );
}
