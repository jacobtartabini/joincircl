
import { useMemo } from "react";
import { Contact } from "@/types/contact";
import { TabsContent } from "@/components/ui/tabs";
import { ContactCard } from "@/components/ui/contact-card";
import { Button } from "@/components/ui/button";

interface CirclesTabContentProps {
  value: "all" | "inner" | "middle" | "outer";
  contacts: Contact[];
  searchQuery: string;
  selectedTags: string[];
  isLoading: boolean;
  onAddInteraction: (contact: Contact) => void;
  onViewInsights: (contact: Contact) => void;
  onAddContact: () => void;
}

export const CirclesTabContent = ({
  value,
  contacts,
  searchQuery,
  selectedTags,
  isLoading,
  onAddInteraction,
  onViewInsights,
  onAddContact
}: CirclesTabContentProps) => {
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // First filter by circle if not "all"
      if (value !== "all" && contact.circle !== value) {
        return false;
      }
      
      // Check if contact matches search query
      const matchesSearch = searchQuery === "" || 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.personal_email && contact.personal_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.mobile_phone && contact.mobile_phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.company_name && contact.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.job_title && contact.job_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.notes && contact.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Check if contact has all selected tags
      const matchesTags = selectedTags.length === 0 || 
        (contact.tags && selectedTags.every(tag => contact.tags?.includes(tag)));
      
      return matchesSearch && matchesTags;
    });
  }, [contacts, value, searchQuery, selectedTags]);

  const circleTypeName = value === "all" ? "" : `${value} circle `;
  
  return (
    <TabsContent value={value} className="mt-4">
      {isLoading ? (
        <LoadingState />
      ) : filteredContacts.length > 0 ? (
        <ContactGrid contacts={filteredContacts} onAddInteraction={onAddInteraction} onViewInsights={onViewInsights} />
      ) : (
        <EmptyState 
          searchActive={searchQuery !== "" || selectedTags.length > 0} 
          circleType={value}
          onAddContact={onAddContact}
        />
      )}
    </TabsContent>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
  </div>
);

interface ContactGridProps {
  contacts: Contact[];
  onAddInteraction: (contact: Contact) => void;
  onViewInsights: (contact: Contact) => void;
}

const ContactGrid = ({ contacts, onAddInteraction, onViewInsights }: ContactGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {contacts.map((contact) => (
      <ContactCard
        key={contact.id}
        contact={contact}
        onAddNote={() => onAddInteraction(contact)}
        onViewInsights={() => onViewInsights(contact)}
      />
    ))}
  </div>
);

interface EmptyStateProps {
  searchActive: boolean;
  circleType: string;
  onAddContact: () => void;
}

const EmptyState = ({ searchActive, circleType, onAddContact }: EmptyStateProps) => {
  const circleMessage = circleType === "all" ? "" : `${circleType} circle `;
  
  return (
    <div className="text-center py-8 border rounded-md bg-muted/30">
      {searchActive ? (
        <p className="text-muted-foreground">No {circleMessage}contacts match your search criteria.</p>
      ) : (
        <>
          <p className="text-muted-foreground">No {circleMessage}contacts yet.</p>
          <Button 
            variant="link" 
            className="mt-2"
            onClick={onAddContact}
          >
            Add your first contact
          </Button>
        </>
      )}
    </div>
  );
};
