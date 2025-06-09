
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, X } from "lucide-react";
import { useId, useState } from "react";
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
  const [open, setOpen] = useState<boolean>(false);

  const handleSelect = (contact: Contact) => {
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
      <Label htmlFor={id}>{label}</Label>
      
      {/* Selected contacts display */}
      {selectedContacts.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedContacts.map((contact) => (
            <Badge
              key={contact.id}
              variant="secondary"
              size="small"
              className="cursor-pointer hover:ring-secondary/50"
            >
              {contact.name}
              <X 
                className="h-3 w-3 cursor-pointer ml-1" 
                onClick={() => handleRemove(contact)} 
              />
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
          >
            <span className={cn("truncate text-muted-foreground")}>
              {selectedContacts.length > 0 
                ? `${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} selected`
                : "Select contacts"
              }
            </span>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No contacts found.</CommandEmpty>
              <CommandGroup>
                {contacts.map((contact) => {
                  const isSelected = selectedContacts.some(c => c.id === contact.id);
                  return (
                    <CommandItem
                      key={contact.id}
                      value={contact.name}
                      onSelect={() => handleSelect(contact)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{contact.name}</span>
                          {(contact.job_title || contact.company_name) && (
                            <span className="text-xs text-muted-foreground">
                              {contact.job_title ? `${contact.job_title}${contact.company_name ? ` at ${contact.company_name}` : ''}` : contact.company_name}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={16} strokeWidth={2} className="text-brand" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
