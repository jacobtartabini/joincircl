
import { useMemo } from "react";
import { Contact } from "@/types/contact";
import { TabsContent } from "@/components/ui/tabs";
import { ContactCard } from "@/components/ui/contact-card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
  contacts = [],  // Provide default empty array
  searchQuery = "",  // Provide default empty string
  selectedTags = [],  // Provide default empty array
  isLoading,
  onAddInteraction,
  onViewInsights,
  onAddContact
}: CirclesTabContentProps) => {
  // Ensure contacts is an array
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  // Ensure selectedTags is an array
  const safeSelectedTags = Array.isArray(selectedTags) ? selectedTags : [];
  // Ensure searchQuery is a string
  const safeSearchQuery = typeof searchQuery === 'string' ? searchQuery : '';
  
  const isMobile = useIsMobile();
  
  const filteredContacts = useMemo(() => {
    return safeContacts.filter(contact => {
      if (!contact) return false; // Skip null/undefined contacts

      // First filter by circle if not "all"
      if (value !== "all" && contact.circle !== value) {
        return false;
      }
      
      // Check if contact matches search query
      const searchTerms = safeSearchQuery.toLowerCase();
      const matchesSearch = safeSearchQuery === "" || 
        (contact.name && contact.name.toLowerCase().includes(searchTerms)) ||
        (contact.personal_email && contact.personal_email.toLowerCase().includes(searchTerms)) ||
        (contact.mobile_phone && contact.mobile_phone.toLowerCase().includes(searchTerms)) ||
        (contact.company_name && contact.company_name.toLowerCase().includes(searchTerms)) ||
        (contact.job_title && contact.job_title.toLowerCase().includes(searchTerms)) ||
        (contact.notes && contact.notes.toLowerCase().includes(searchTerms));
      
      // Check if contact has all selected tags - safely handle undefined tags
      const contactTags = Array.isArray(contact.tags) ? contact.tags : [];
      const matchesTags = safeSelectedTags.length === 0 || 
        safeSelectedTags.every(tag => contactTags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [safeContacts, value, safeSearchQuery, safeSelectedTags]);

  const circleTypeName = value === "all" ? "" : `${value} circle `;
  
  return (
    <TabsContent value={value} className="mt-4">
      {isLoading ? (
        <LoadingState />
      ) : filteredContacts.length > 0 ? (
        <ContactGrid contacts={filteredContacts} onAddInteraction={onAddInteraction} onViewInsights={onViewInsights} />
      ) : (
        <EmptyState 
          searchActive={safeSearchQuery !== "" || safeSelectedTags.length > 0} 
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

const ContactGrid = ({ contacts, onAddInteraction, onViewInsights }: ContactGridProps) => {
  // Ensure contacts is an array
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const isMobile = useIsMobile();
  
  return (
    <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
      {safeContacts.map((contact, index) => (
        <ContactCard
          key={contact.id || `contact-${index}`}
          contact={contact}
          onAddNote={onAddInteraction}
          onViewInsights={onViewInsights}
        />
      ))}
    </div>
  );
};

interface EmptyStateProps {
  searchActive: boolean;
  circleType: string;
  onAddContact: () => void;
}

const EmptyState = ({ searchActive, circleType, onAddContact }: EmptyStateProps) => {
  const circleMessage = circleType === "all" ? "" : `${circleType} circle `;
  const isMobile = useIsMobile();
  
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
