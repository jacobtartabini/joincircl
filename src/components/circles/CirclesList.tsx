import { Contact } from "@/types/contact";
import { CircleCard } from "./CircleCard";
import { CircleCardSkeleton } from "./CircleCardSkeleton";
import { Users } from "lucide-react";
import ImportContactsDialog from "./ImportContactsDialog";
import { useState } from "react";

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
  const [importOpen, setImportOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <CircleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
        <p className="text-gray-600 text-center max-w-sm leading-relaxed">
          Add your first contact to get started building your network.
        </p>
        {/* Import contacts CTA */}
        <Button onClick={() => setImportOpen(true)} className="mt-6 bg-[#30a2ed] text-white rounded-full flex gap-2 items-center px-6 py-3">
          <FileUp className="w-5 h-5" />
          Import Contacts
        </Button>
        <ImportContactsDialog open={importOpen} onOpenChange={setImportOpen} onImportSuccess={() => {}} refetchContacts={() => {}} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
