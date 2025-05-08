
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Tags, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import CircleImportButtons from "@/components/circles/CircleImportButtons";

interface SearchFilterBarProps {
  allTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onAddContact: () => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SearchFilterBar({
  allTags = [],  // Provide default empty array
  selectedTags = [],  // Provide default empty array
  onTagsChange,
  onAddContact,
  onRefresh,
  searchQuery = "",  // Provide default empty string
  onSearchChange
}: SearchFilterBarProps) {
  const [open, setOpen] = useState(false);

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    setOpen(false);
  };

  const handleTagRemove = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag));
  };

  const handleClearTags = () => {
    onTagsChange([]);
  };

  // Safe list of tags - ensure allTags is always an array
  const safeAllTags = Array.isArray(allTags) ? allTags : [];
  // Safe list of selected tags - ensure selectedTags is always an array
  const safeSelectedTags = Array.isArray(selectedTags) ? selectedTags : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter button moved here, before import buttons */}
        {safeAllTags.length > 0 && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-sm flex items-center"
              >
                <Tags className="h-4 w-4 mr-1" /> Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  {safeAllTags
                    .filter(tag => !safeSelectedTags.includes(tag))
                    .map((tag) => (
                      <CommandItem
                        key={tag}
                        value={tag}
                        onSelect={() => handleTagSelect(tag)}
                      >
                        {tag}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )}
        
        <CircleImportButtons onImportSuccess={onRefresh} />
      </div>

      <div className="flex items-center gap-2">
        {safeSelectedTags.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1 items-center">
              {safeSelectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleTagRemove(tag)}
                  />
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1 text-xs text-muted-foreground"
              onClick={handleClearTags}
            >
              Clear
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
