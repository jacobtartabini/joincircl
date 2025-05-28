
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({ 
  searchQuery = "", 
  onSearchChange, 
  placeholder = "Search contacts...",
  className = ""
}: SearchInputProps) => {
  const safeSearchQuery = typeof searchQuery === 'string' ? searchQuery : '';
  
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-10 h-10"
        value={safeSearchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {safeSearchQuery && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-8 w-8 p-0"
          onClick={() => onSearchChange("")}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
