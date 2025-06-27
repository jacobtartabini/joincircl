
import { Search, Plus, SlidersHorizontal, FileUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import ImportContactsDialog from "./ImportContactsDialog";

interface CirclesFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddContact: () => void;
  onSort: (sortBy: string) => void;
  onFilter: (filter: string | null) => void;
  activeTagFilter?: string | null;
  refetchContacts: () => void;
}

export function CirclesFilter({
  searchQuery,
  onSearchChange,
  onAddContact,
  onSort,
  onFilter,
  activeTagFilter,
  refetchContacts
}: CirclesFilterProps) {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      {/* Search - Takes most space with unified styling */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-3 h-12 w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-background rounded-full shadow-sm focus-visible:ring-2 focus-visible:ring-[#0daeec]/30 transition-all duration-200"
          style={{
            boxShadow: '0 2px 12px 0 rgba(36, 156, 255, 0.05)'
          }}
        />
      </div>

      {/* Active Tag Filter Badge */}
      {activeTagFilter && (
        <Badge 
          variant="secondary" 
          className="px-3 py-2 h-12 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors rounded-full flex items-center"
        >
          <span className="text-sm font-medium">Tag: {activeTagFilter}</span>
          <button
            onClick={() => onFilter(null)}
            className="ml-2 text-blue-500 hover:text-blue-700 font-medium"
            aria-label="Remove tag filter"
          >
            ×
          </button>
        </Badge>
      )}

      {/* Sort & Filter Dropdown - Unified styling */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-12 px-4 border-gray-200 hover:bg-gray-50 transition-all duration-200 rounded-full flex items-center gap-2"
            aria-label="Sort and filter options"
          >
            <SlidersHorizontal className="h-5 w-5" />
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

      {/* Import Contacts Button - Unified styling */}
      <Button
        variant="outline"
        size="sm"
        aria-label="Import Contacts"
        className="h-12 px-4 flex items-center gap-2 rounded-full border-gray-200 hover:bg-gray-50 transition-all duration-200"
        onClick={() => setImportOpen(true)}
      >
        <FileUp className="h-5 w-5" />
        <span className="text-sm font-medium">Import</span>
      </Button>

      {/* Add Contact Button - Blue color scheme with unified styling */}
      <Button
        onClick={onAddContact}
        size="sm"
        aria-label="Add new contact"
        className="h-12 px-4 text-white transition-all duration-200 rounded-full bg-gradient-to-r from-[#0daeec]/90 to-[#0daeec]/70 hover:from-[#0daeec]/95 hover:to-[#0daeec]/80 border-[#0daeec]/30 flex items-center gap-2"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Add</span>
      </Button>

      {/* Dialog */}
      <ImportContactsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportSuccess={() => {}}
        refetchContacts={refetchContacts}
      />
    </div>
  );
}
