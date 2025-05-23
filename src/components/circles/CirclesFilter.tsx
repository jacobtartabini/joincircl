
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SortAsc, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CirclesFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddContact: () => void;
  onSort: (sortBy: string) => void;
  onFilter: (filterBy: string) => void;
}

export function CirclesFilter({
  searchQuery,
  onSearchChange,
  onAddContact,
  onSort,
  onFilter
}: CirclesFilterProps) {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Circles</h1>
        <Button onClick={onAddContact}>
          <Plus className="mr-2 h-4 w-4" />
          New Person
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onFilter("inner")}>
                Inner circle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilter("middle")}>
                Middle circle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilter("outer")}>
                Outer circle
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSort("name")}>
              <SortAsc className="mr-2 h-4 w-4" /> Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort("recent")}>
              <SortAsc className="mr-2 h-4 w-4" /> Most recent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
