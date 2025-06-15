
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CalendarPlus,
  CalendarSync,
  Check,
  Circle,
  Building2,
  Tag,
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  X,
} from "lucide-react";
import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";

interface AnimateChangeInHeightProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimateChangeInHeight: React.FC<AnimateChangeInHeightProps> = ({
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const observedHeight = entries[0].contentRect.height;
        setHeight(observedHeight);
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <motion.div
      className={cn(className, "overflow-hidden")}
      style={{ height }}
      animate={{ height }}
      transition={{ duration: 0.1, damping: 0.2, ease: "easeIn" }}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  );
};

export enum FilterType {
  CIRCLE = "Circle",
  COMPANY = "Company",
  TAGS = "Tags",
  INDUSTRY = "Industry",
  UNIVERSITY = "University",
  LOCATION = "Location",
  LAST_CONTACT = "Last Contact",
  CREATED_DATE = "Created Date",
  UPDATED_DATE = "Updated Date",
}

export enum FilterOperator {
  IS = "is",
  IS_NOT = "is not",
  IS_ANY_OF = "is any of",
  INCLUDE = "include",
  DO_NOT_INCLUDE = "do not include",
  INCLUDE_ALL_OF = "include all of", 
  INCLUDE_ANY_OF = "include any of",
  EXCLUDE_ALL_OF = "exclude all of",
  EXCLUDE_IF_ANY_OF = "exclude if any of",
  BEFORE = "before",
  AFTER = "after",
}

export enum CircleType {
  INNER = "inner",
  MIDDLE = "middle", 
  OUTER = "outer",
}

export enum DateRange {
  IN_THE_PAST = "in the past",
  IN_24_HOURS = "24 hours from now",
  IN_3_DAYS = "3 days from now",
  IN_1_WEEK = "1 week from now",
  IN_1_MONTH = "1 month from now",
  IN_3_MONTHS = "3 months from now",
}

export type FilterOption = {
  name: FilterType | CircleType | DateRange | string;
  icon: React.ReactNode | undefined;
  label?: string;
};

export type Filter = {
  id: string;
  type: FilterType;
  operator: FilterOperator;
  value: string[];
};

const FilterIcon = ({ type }: { type: FilterType | CircleType | string }) => {
  switch (type) {
    case FilterType.CIRCLE:
      return <Circle className="size-3.5 text-[#0daeec]" />;
    case FilterType.COMPANY:
      return <Building2 className="size-3.5 text-blue-500" />;
    case FilterType.TAGS:
      return <Tag className="size-3.5 text-purple-500" />;
    case FilterType.INDUSTRY:
      return <Briefcase className="size-3.5 text-orange-500" />;
    case FilterType.UNIVERSITY:
      return <GraduationCap className="size-3.5 text-green-500" />;
    case FilterType.LOCATION:
      return <MapPin className="size-3.5 text-red-500" />;
    case FilterType.LAST_CONTACT:
      return <Calendar className="size-3.5 text-amber-500" />;
    case FilterType.CREATED_DATE:
      return <CalendarPlus className="size-3.5 text-indigo-500" />;
    case FilterType.UPDATED_DATE:
      return <CalendarSync className="size-3.5 text-teal-500" />;
    case CircleType.INNER:
      return <div className="bg-green-500 rounded-full size-2.5" />;
    case CircleType.MIDDLE:
      return <div className="bg-yellow-500 rounded-full size-2.5" />;
    case CircleType.OUTER:
      return <div className="bg-gray-400 rounded-full size-2.5" />;
    default:
      return <div className="bg-gray-300 rounded-full size-2.5" />;
  }
};

export const filterViewOptions: FilterOption[][] = [
  [
    {
      name: FilterType.CIRCLE,
      icon: <FilterIcon type={FilterType.CIRCLE} />,
    },
    {
      name: FilterType.COMPANY,
      icon: <FilterIcon type={FilterType.COMPANY} />,
    },
    {
      name: FilterType.TAGS,
      icon: <FilterIcon type={FilterType.TAGS} />,
    },
    {
      name: FilterType.INDUSTRY,
      icon: <FilterIcon type={FilterType.INDUSTRY} />,
    },
  ],
  [
    {
      name: FilterType.UNIVERSITY,
      icon: <FilterIcon type={FilterType.UNIVERSITY} />,
    },
    {
      name: FilterType.LOCATION,
      icon: <FilterIcon type={FilterType.LOCATION} />,
    },
  ],
  [
    {
      name: FilterType.LAST_CONTACT,
      icon: <FilterIcon type={FilterType.LAST_CONTACT} />,
    },
    {
      name: FilterType.CREATED_DATE,
      icon: <FilterIcon type={FilterType.CREATED_DATE} />,
    },
    {
      name: FilterType.UPDATED_DATE,
      icon: <FilterIcon type={FilterType.UPDATED_DATE} />,
    },
  ],
];

export const circleFilterOptions: FilterOption[] = Object.values(CircleType).map(
  (circle) => ({
    name: circle,
    icon: <FilterIcon type={circle} />,
    label: circle.charAt(0).toUpperCase() + circle.slice(1),
  })
);

export const dateFilterOptions: FilterOption[] = Object.values(DateRange).map(
  (date) => ({
    name: date,
    icon: undefined,
  })
);

const filterOperators = ({
  filterType,
  filterValues,
}: {
  filterType: FilterType;
  filterValues: string[];
}) => {
  switch (filterType) {
    case FilterType.CIRCLE:
    case FilterType.COMPANY:
    case FilterType.INDUSTRY:
    case FilterType.UNIVERSITY:
    case FilterType.LOCATION:
      if (Array.isArray(filterValues) && filterValues.length > 1) {
        return [FilterOperator.IS_ANY_OF, FilterOperator.IS_NOT];
      } else {
        return [FilterOperator.IS, FilterOperator.IS_NOT];
      }
    case FilterType.TAGS:
      if (Array.isArray(filterValues) && filterValues.length > 1) {
        return [
          FilterOperator.INCLUDE_ANY_OF,
          FilterOperator.INCLUDE_ALL_OF,
          FilterOperator.EXCLUDE_ALL_OF,
          FilterOperator.EXCLUDE_IF_ANY_OF,
        ];
      } else {
        return [FilterOperator.INCLUDE, FilterOperator.DO_NOT_INCLUDE];
      }
    case FilterType.LAST_CONTACT:
    case FilterType.CREATED_DATE:
    case FilterType.UPDATED_DATE:
      if (filterValues?.includes(DateRange.IN_THE_PAST)) {
        return [FilterOperator.IS, FilterOperator.IS_NOT];
      } else {
        return [FilterOperator.BEFORE, FilterOperator.AFTER];
      }
    default:
      return [];
  }
};

const FilterOperatorDropdown = ({
  filterType,
  operator,
  filterValues,
  setOperator,
}: {
  filterType: FilterType;
  operator: FilterOperator;
  filterValues: string[];
  setOperator: (operator: FilterOperator) => void;
}) => {
  const operators = filterOperators({ filterType, filterValues });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 px-1.5 py-1 text-gray-600 dark:text-gray-300 hover:text-[#0daeec] dark:hover:text-[#0daeec] transition shrink-0 text-xs">
        {operator}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-fit min-w-fit bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        {operators.map((operator) => (
          <DropdownMenuItem
            key={operator}
            onClick={() => setOperator(operator)}
            className="text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {operator}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FilterValueCombobox = ({
  filterType,
  filterValues,
  setFilterValues,
  options,
}: {
  filterType: FilterType;
  filterValues: string[];
  setFilterValues: (filterValues: string[]) => void;
  options: FilterOption[];
}) => {
  const [open, setOpen] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const nonSelectedFilterValues = options?.filter(
    (filter) => !filterValues.includes(filter.name as string)
  );

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setTimeout(() => {
            setCommandInput("");
          }, 200);
        }
      }}
    >
      <PopoverTrigger className="rounded-none px-1.5 py-1 bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition text-gray-600 dark:text-gray-300 hover:text-[#0daeec] dark:hover:text-[#0daeec] shrink-0 text-xs">
        <div className="flex gap-1.5 items-center">
          <div className="flex items-center flex-row -space-x-1">
            <AnimatePresence mode="popLayout">
              {filterValues?.slice(0, 3).map((value) => (
                <motion.div
                  key={value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FilterIcon type={value} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {filterValues?.length === 1
            ? filterValues?.[0]
            : `${filterValues?.length} selected`}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <AnimateChangeInHeight>
          <Command>
            <CommandInput
              placeholder={filterType}
              className="h-9 text-xs"
              value={commandInput}
              onInputCapture={(e) => {
                setCommandInput(e.currentTarget.value);
              }}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {filterValues.map((value) => (
                  <CommandItem
                    key={value}
                    className="group flex gap-2 items-center text-xs"
                    onSelect={() => {
                      setFilterValues(filterValues.filter((v) => v !== value));
                      setTimeout(() => {
                        setCommandInput("");
                      }, 200);
                      setOpen(false);
                    }}
                  >
                    <Checkbox checked={true} />
                    <FilterIcon type={value} />
                    {value}
                  </CommandItem>
                ))}
              </CommandGroup>
              {nonSelectedFilterValues?.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    {nonSelectedFilterValues.map((filter: FilterOption) => (
                      <CommandItem
                        className="group flex gap-2 items-center text-xs"
                        key={filter.name as string}
                        value={filter.name as string}
                        onSelect={(currentValue: string) => {
                          setFilterValues([...filterValues, currentValue]);
                          setTimeout(() => {
                            setCommandInput("");
                          }, 200);
                          setOpen(false);
                        }}
                      >
                        <Checkbox
                          checked={false}
                          className="opacity-0 group-data-[selected=true]:opacity-100"
                        />
                        {filter.icon}
                        <span className="text-gray-700 dark:text-gray-200">
                          {filter.label || filter.name}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  );
};

const FilterValueDateCombobox = ({
  filterType,
  filterValues,
  setFilterValues,
}: {
  filterType: FilterType;
  filterValues: string[];
  setFilterValues: (filterValues: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [commandInput, setCommandInput] = useState("");

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setTimeout(() => {
            setCommandInput("");
          }, 200);
        }
      }}
    >
      <PopoverTrigger className="rounded-none px-1.5 py-1 bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition text-gray-600 dark:text-gray-300 hover:text-[#0daeec] dark:hover:text-[#0daeec] shrink-0 text-xs">
        {filterValues?.[0]}
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <AnimateChangeInHeight>
          <Command>
            <CommandInput
              placeholder={filterType}
              className="h-9 text-xs"
              value={commandInput}
              onInputCapture={(e) => {
                setCommandInput(e.currentTarget.value);
              }}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {dateFilterOptions.map((filter: FilterOption) => (
                  <CommandItem
                    className="group flex gap-2 items-center text-xs"
                    key={filter.name as string}
                    value={filter.name as string}
                    onSelect={(currentValue: string) => {
                      setFilterValues([currentValue]);
                      setTimeout(() => {
                        setCommandInput("");
                      }, 200);
                      setOpen(false);
                    }}
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      {filter.name}
                    </span>
                    <Check
                      className={cn(
                        "ml-auto h-3 w-3",
                        filterValues.includes(filter.name as string)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  );
};

export default function Filters({
  filters,
  setFilters,
  filterOptions,
}: {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  filterOptions: Record<FilterType, FilterOption[]>;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters
        .filter((filter) => filter.value?.length > 0)
        .map((filter) => (
          <div key={filter.id} className="flex gap-[1px] items-center text-xs">
            <div className="flex gap-1.5 shrink-0 rounded-l-full bg-gray-50 dark:bg-gray-800/40 px-2 py-1 items-center border border-gray-200 dark:border-gray-700">
              <FilterIcon type={filter.type} />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{filter.type}</span>
            </div>
            <FilterOperatorDropdown
              filterType={filter.type}
              operator={filter.operator}
              filterValues={filter.value}
              setOperator={(operator) => {
                setFilters((prev) =>
                  prev.map((f) => (f.id === filter.id ? { ...f, operator } : f))
                );
              }}
            />
            {filter.type === FilterType.CREATED_DATE ||
            filter.type === FilterType.UPDATED_DATE ||
            filter.type === FilterType.LAST_CONTACT ? (
              <FilterValueDateCombobox
                filterType={filter.type}
                filterValues={filter.value}
                setFilterValues={(filterValues) => {
                  setFilters((prev) =>
                    prev.map((f) =>
                      f.id === filter.id ? { ...f, value: filterValues } : f
                    )
                  );
                }}
              />
            ) : (
              <FilterValueCombobox
                filterType={filter.type}
                filterValues={filter.value}
                options={filterOptions[filter.type] || []}
                setFilterValues={(filterValues) => {
                  setFilters((prev) =>
                    prev.map((f) =>
                      f.id === filter.id ? { ...f, value: filterValues } : f
                    )
                  );
                }}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFilters((prev) => prev.filter((f) => f.id !== filter.id));
              }}
              className="bg-gray-50 dark:bg-gray-800/40 rounded-l-none rounded-r-full h-6 w-6 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0 border border-l-0 border-gray-200 dark:border-gray-700"
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}
    </div>
  );
}
