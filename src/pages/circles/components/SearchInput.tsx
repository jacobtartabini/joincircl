
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchInput = ({ searchQuery = "", onSearchChange }: SearchInputProps) => {
  const safeSearchQuery = typeof searchQuery === 'string' ? searchQuery : '';
  
  return (
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
  );
};
