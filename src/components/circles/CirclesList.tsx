
import { Contact } from "@/types/contact";
import { CircleCard } from "./CircleCard";
import { CircleCardSkeleton } from "./CircleCardSkeleton";

interface CirclesListProps {
  contacts: Contact[];
  isLoading: boolean;
  onSelectContact: (contact: Contact) => void;
  selectedContactId: string | null;
}

export function CirclesList({ 
  contacts, 
  isLoading, 
  onSelectContact,
  selectedContactId
}: CirclesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <CircleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-center">
          No contacts found. Add your first contact to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <CircleCard
          key={contact.id}
          contact={contact}
          onClick={() => onSelectContact(contact)}
          isSelected={selectedContactId === contact.id}
        />
      ))}
    </div>
  );
}
