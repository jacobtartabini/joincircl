
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <div className="flex items-center gap-3 p-4 border-b bg-white">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Active Tag Filter Badge */}
      {activeTagFilter && (
        <Badge variant="secondary" className="px-3 py-1">
          Tag: {activeTagFilter}
          <button
            onClick={() => onFilter(null)}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </Badge>
      )}

      {/* Sort & Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Sort & Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onSort("name")}>
            Sort by Name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSort("recent")}>
            Sort by Recent Contact
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilter("inner")}>
            Inner Circle Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilter("middle")}>
            Middle Circle Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilter("outer")}>
            Outer Circle Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilter(null)}>
            Clear Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Contact */}
      <Button onClick={onAddContact} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Contact
      </Button>
    </div>
  );
}
