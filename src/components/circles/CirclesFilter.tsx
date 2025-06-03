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
  return <div className="flex items-center gap-2 p-4 border-b bg-white rounded-2xl">
      {/* Search - Expanded to take more space */}
      <div className="relative flex-1 max-w-none">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input placeholder="Search contacts..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} className="pl-10 h-10 rounded-full" />
      </div>

      {/* Active Tag Filter Badge */}
      {activeTagFilter && <Badge variant="secondary" className="px-3 py-1 shrink-0">
          Tag: {activeTagFilter}
          <button onClick={() => onFilter(null)} className="ml-2 text-muted-foreground hover:text-foreground" aria-label="Remove tag filter">
            ×
          </button>
        </Badge>}

      {/* Sort & Filter - Icon only */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 w-10 p-0 shrink-0" aria-label="Sort and filter options">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white">
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

      {/* Add Contact - Icon only */}
      <Button onClick={onAddContact} size="sm" className="h-10 w-10 p-0 shrink-0" aria-label="Add new contact">
        <Plus className="h-4 w-4" />
      </Button>
    </div>;
}