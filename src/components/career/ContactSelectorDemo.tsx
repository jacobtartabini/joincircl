
import { useState } from "react";
import { MultiContactSelector } from "@/components/ui/multi-contact-selector";
import { useContacts } from "@/hooks/use-contacts";
import { Contact } from "@/types/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContactSelectorDemo() {
  const { contacts, isLoading } = useContacts();
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Selector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading contacts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Contacts for this Application</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MultiContactSelector
          contacts={contacts}
          selectedContacts={selectedContacts}
          onSelectionChange={setSelectedContacts}
          label="Choose relevant contacts from your network"
          placeholder="Search by name, company, or job title..."
        />
        
        {selectedContacts.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Selected Contacts:</h4>
            <div className="space-y-2">
              {selectedContacts.map(contact => (
                <div key={contact.id} className="text-sm text-muted-foreground">
                  <span className="font-medium">{contact.name}</span>
                  {contact.job_title && contact.company_name && (
                    <span> - {contact.job_title} at {contact.company_name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
