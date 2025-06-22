
"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTags } from "@/hooks/use-tags";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/contact";

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  contactData?: Partial<Contact>;
  maxTags?: number;
  placeholder?: string;
}

export function TagsInput({ 
  tags = [], 
  onChange, 
  contactData = {}, 
  maxTags = 10,
  placeholder = "Add tag..."
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  
  // Convert string tags to Tag objects for the hook
  const initialTags = tags.map(tag => ({ id: tag, label: tag }));
  
  const { 
    tags: tagObjects, 
    addTag, 
    removeTag, 
    removeLastTag, 
    hasReachedMax 
  } = useTags({
    defaultTags: initialTags,
    maxTags,
    onChange: (newTags) => onChange(newTags.map(t => t.label)),
  });

  // Generate smart tag suggestions based on contact data
  const suggestions = useMemo(() => {
    const allSuggestions = new Set<string>();
    
    // Job/Career related tags
    if (contactData.job_title) {
      const title = contactData.job_title.toLowerCase();
      if (title.includes('engineer')) allSuggestions.add('Engineering');
      if (title.includes('manager')) allSuggestions.add('Management');
      if (title.includes('developer')) allSuggestions.add('Development');
      if (title.includes('designer')) allSuggestions.add('Design');
      if (title.includes('sales')) allSuggestions.add('Sales');
      if (title.includes('marketing')) allSuggestions.add('Marketing');
      if (title.includes('data')) allSuggestions.add('Data Science');
      if (title.includes('product')) allSuggestions.add('Product');
      if (title.includes('ceo') || title.includes('founder')) allSuggestions.add('Leadership');
    }
    
    // Industry tags
    if (contactData.industry) {
      allSuggestions.add(contactData.industry);
      const industry = contactData.industry.toLowerCase();
      if (industry.includes('tech')) allSuggestions.add('Technology');
      if (industry.includes('finance')) allSuggestions.add('Finance');
      if (industry.includes('healthcare')) allSuggestions.add('Healthcare');
    }
    
    // Company related
    if (contactData.company_name) {
      const company = contactData.company_name.toLowerCase();
      if (company.includes('startup')) allSuggestions.add('Startup');
      if (company.includes('corp') || company.includes('corporation')) allSuggestions.add('Corporate');
    }
    
    // Education related
    if (contactData.university) {
      allSuggestions.add('Alumni');
      if (contactData.major) allSuggestions.add(contactData.major);
    }
    
    // Circle based tags
    if (contactData.circle === 'inner') allSuggestions.add('Close Friend');
    if (contactData.circle === 'middle') allSuggestions.add('Friend');
    if (contactData.circle === 'outer') allSuggestions.add('Acquaintance');
    
    // Location based
    if (contactData.location) {
      const location = contactData.location.toLowerCase();
      if (location.includes('san francisco') || location.includes('sf')) allSuggestions.add('Bay Area');
      if (location.includes('new york') || location.includes('nyc')) allSuggestions.add('NYC');
      if (location.includes('los angeles') || location.includes('la')) allSuggestions.add('LA');
      if (location.includes('remote')) allSuggestions.add('Remote');
    }
    
    // Social platforms
    if (contactData.linkedin) allSuggestions.add('LinkedIn');
    if (contactData.twitter) allSuggestions.add('Twitter');
    
    // Common relationship tags
    allSuggestions.add('Colleague');
    allSuggestions.add('Mentor');
    allSuggestions.add('Client');
    allSuggestions.add('Networking');
    allSuggestions.add('Conference');
    allSuggestions.add('Referral');
    allSuggestions.add('Family');
    allSuggestions.add('School');
    
    // Filter out already selected tags and convert to suggestion format
    const currentTagLabels = tagObjects.map(t => t.label.toLowerCase());
    return Array.from(allSuggestions)
      .filter(suggestion => !currentTagLabels.includes(suggestion.toLowerCase()))
      .slice(0, 8) // Limit suggestions
      .map(label => ({ id: label.toLowerCase().replace(/\s+/g, '-'), label }));
  }, [contactData, tagObjects]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !inputValue) {
      e.preventDefault();
      removeLastTag();
    }
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !tagObjects.find(t => t.label.toLowerCase() === trimmedValue.toLowerCase())) {
        addTag({ id: trimmedValue.toLowerCase().replace(/\s+/g, '-'), label: trimmedValue });
        setInputValue("");
      }
    }
  };

  return (
    <div className="space-y-3">
      <div 
        className="glass-input rounded-2xl p-3 transition-all duration-500"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        }}
      >
        <div className="flex flex-wrap gap-2">
          {tagObjects.map((tag) => (
            <span
              key={tag.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-all duration-300",
                tag.color || "bg-primary/20 text-primary backdrop-blur-sm border border-primary/30"
              )}
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            >
              {tag.label}
              <button
                onClick={() => removeTag(tag.id)}
                className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20 transition-colors duration-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasReachedMax ? "Max tags reached" : placeholder}
            disabled={hasReachedMax}
            className="flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground/80 disabled:cursor-not-allowed min-w-[120px]"
          />
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground/80">Suggestions</label>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!tagObjects.find(t => t.id === suggestion.id)) {
                    addTag(suggestion);
                  }
                }}
                disabled={hasReachedMax || tagObjects.find(t => t.id === suggestion.id)}
                className="h-8 px-3 py-1 text-xs rounded-full glass-button transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
