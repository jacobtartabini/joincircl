
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KeystoneFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: "all" | "upcoming" | "past";
  onFilterChange: (filter: "all" | "upcoming" | "past") => void;
}

export function KeystoneFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange
}: KeystoneFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search keystones by name, contact, or notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 rounded-full border-border bg-card focus:border-primary transition-colors"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={activeFilter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("upcoming")}
          className="rounded-full px-4 py-2 font-medium transition-all"
        >
          Upcoming
        </Button>
        <Button
          variant={activeFilter === "past" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("past")}
          className="rounded-full px-4 py-2 font-medium transition-all"
        />
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("all")}
          className="rounded-full px-4 py-2 font-medium transition-all"
        />
      </div>
    </div>
  );
}
