"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, X } from "lucide-react";
import { useId, useState, useMemo } from "react";
import { Contact } from "@/types/contact";

interface MultiContactSelectorProps {
  contacts: Contact[];
  selectedContacts: Contact[];
  onSelectionChange: (contacts: Contact[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function MultiContactSelector({
  contacts,
  selectedContacts,
  onSelectionChange,
  label = "Select contacts",
  placeholder = "Search contacts...",
  className
}: MultiContactSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Filter contacts based on search value
  const filteredContacts = useMemo(() => {
    if (!searchValue.trim()) return contacts;
    const searchLower = searchValue.toLowerCase();
    return contacts.filter(contact => {
      return (
        contact.name.toLowerCase().includes(searchLower) ||
        (contact.job_title && contact.job_title.toLowerCase().includes(searchLower)) ||
        (contact.company_name && contact.company_name.toLowerCase().includes(searchLower)) ||
        (contact.personal_email && contact.personal_email.toLowerCase().includes(searchLower))
      );
    });
  }, [contacts, searchValue]);

  const handleSelect = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const isSelected = selectedContacts.some(c => c.id === contact.id);
    if (isSelected) {
      onSelectionChange(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      onSelectionChange([...selectedContacts, contact]);
    }
  };

  const handleRemove = (contactToRemove: Contact) => {
    onSelectionChange(selectedContacts.filter(c => c.id !== contactToRemove.id));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      
      {/* Selected contacts display */}
      {selectedContacts.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedContacts.map(contact => (
            <Badge key={contact.id} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
              <span className="truncate max-w-[120px]">{contact.name}</span>
              <X 
                className="h-3 w-3 cursor-pointer ml-1 hover:text-destructive shrink-0" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(contact);
                }} 
              />
            </Badge>
          ))}
        </div>
      )}

      <Button
        id={id}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between bg-background px-3 font-normal"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="truncate text-muted-foreground">
          {selectedContacts.length > 0 
            ? `${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}` 
            : "Select contacts"
          }
        </span>
        <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-muted-foreground/80" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={placeholder}
          value={searchValue}
          onValueChange={setSearchValue}
          className="h-9"
          autoFocus
        />
        <CommandList>
          <CommandEmpty>
            {searchValue ? "No contacts found matching your search." : "No contacts available."}
          </CommandEmpty>
          <CommandGroup>
            {filteredContacts.map(contact => {
              const isSelected = selectedContacts.some(c => c.id === contact.id);
              return (
                <CommandItem
                  key={contact.id}
                  value={contact.id}
                  onSelect={() => handleSelect(contact.id)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer py-2 px-2",
                    isSelected && "bg-accent text-accent-foreground"
                  )}
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">{contact.name}</span>
                      {(contact.job_title || contact.company_name) && (
                        <span className="text-xs text-muted-foreground truncate">
                          {contact.job_title 
                            ? `${contact.job_title}${contact.company_name ? ` at ${contact.company_name}` : ''}` 
                            : contact.company_name
                          }
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={16} strokeWidth={2} className="text-primary shrink-0" />
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
