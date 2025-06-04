
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface CirclesFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddContact: () => void;
  onSort: (sortBy: string) => void;
  onFilter: (filter: string | null) => void;
  activeTagFilter?: string | null;
}

export function CirclesFilter({
  searchQuery,
  onSearchChange,
  onAddContact,
  onSort,
  onFilter,
  activeTagFilter
}: CirclesFilterProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Search - Takes most space */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          placeholder="Search contacts..." 
          value={searchQuery} 
          onChange={e => onSearchChange(e.target.value)} 
          className="pl-10 h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-300 transition-colors rounded-lg" 
        />
      </div>

      {/* Active Tag Filter Badge */}
      {activeTagFilter && (
        <Badge 
          variant="secondary" 
          className="px-3 py-1.5 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <span className="text-xs font-medium">Tag: {activeTagFilter}</span>
          <button 
            onClick={() => onFilter(null)} 
            className="ml-2 text-blue-500 hover:text-blue-700 font-medium" 
            aria-label="Remove tag filter"
          >
            ×
          </button>
        </Badge>
      )}

      {/* Sort & Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-3 border-gray-200 hover:bg-gray-50 transition-colors rounded-lg" 
            aria-label="Sort and filter options"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Filter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg">
          <DropdownMenuItem onClick={() => onSort("name")} className="text-sm">
            Sort by Name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSort("recent")} className="text-sm">
            Sort by Recent Contact
          </DropdownMenuItem>
          <div className="border-t border-gray-100 my-1"></div>
          <DropdownMenuItem onClick={() => onFilter("inner")} className="text-sm">
            Inner Circle Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilter("middle")} className="text-sm">
            Middle Circle Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilter("outer")} className="text-sm">
            Outer Circle Only
          </DropdownMenuItem>
          <div className="border-t border-gray-100 my-1"></div>
          <DropdownMenuItem onClick={() => onFilter(null)} className="text-sm">
            Clear Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Contact Button */}
      <Button 
        onClick={onAddContact} 
        size="sm" 
        className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-lg"
        aria-label="Add new contact"
      >
        <Plus className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Add</span>
      </Button>
    </div>
  );
}
