
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import CircleImportButtons from "@/components/circles/CircleImportButtons";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  // Safe list of tags - ensure allTags is always an array
  const safeAllTags = Array.isArray(allTags) ? allTags : [];
  // Safe list of selected tags - ensure selectedTags is always an array
  const safeSelectedTags = Array.isArray(selectedTags) ? selectedTags : [];
  // Safe search query - ensure searchQuery is always a string
  const safeSearchQuery = typeof searchQuery === 'string' ? searchQuery : "";

  const handleTagSelect = (tag: string) => {
    if (tag && !safeSelectedTags.includes(tag)) {
      onTagsChange([...safeSelectedTags, tag]);
    }
    setOpen(false);
  };

  const handleTagRemove = (tag: string) => {
    if (tag) {
      onTagsChange(safeSelectedTags.filter((t) => t !== tag));
    }
  };

  const handleClearTags = () => {
    onTagsChange([]);
  };

  // Filter out available tags that aren't already selected
  // Make sure to handle any undefined values and filter out null/empty tags
  const availableTags = safeAllTags
    .filter(tag => tag && typeof tag === 'string' && tag.trim() !== '' && !safeSelectedTags.includes(tag));

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-3`}>
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-8 h-10"
            value={safeSearchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {safeSearchQuery && (
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

        <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
          {/* Only show filter button if there are tags available */}
          {safeAllTags.length > 0 && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 flex items-center justify-center ${isMobile ? '' : ''}`}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-60 p-0" 
                align={isMobile ? "center" : "start"}
                sideOffset={isMobile ? 8 : 4}
              >
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandEmpty>No tags found.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {availableTags.length > 0 ? (
                      availableTags.map((tag) => (
                        <CommandItem
                          key={tag || "placeholder-key"}
                          value={tag || "placeholder-value"}
                          onSelect={() => handleTagSelect(tag)}
                        >
                          {tag || ""}
                        </CommandItem>
                      ))
                    ) : (
                      <div className="py-2 px-2 text-sm text-muted-foreground">
                        No more tags available
                      </div>
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          
          <CircleImportButtons 
            onImportSuccess={onRefresh} 
            className={isMobile ? "flex-1" : ""}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {safeSelectedTags.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1 items-center">
              {safeSelectedTags.map((tag) => (
                <Badge key={tag || "placeholder-key"} variant="secondary" className="flex items-center gap-1">
                  {tag || ""}
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
