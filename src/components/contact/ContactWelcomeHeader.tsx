
import React from 'react';
import { Contact } from '@/types/contact';

interface ContactWelcomeHeaderProps {
  contact: Contact | null;
}

export function ContactWelcomeHeader({ contact }: ContactWelcomeHeaderProps) {
  if (!contact) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-muted-foreground">
          Select a contact to view details
        </h2>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {contact.name}
      </h2>
      {contact.job_title && contact.company_name && (
        <p className="text-muted-foreground">
          {contact.job_title} at {contact.company_name}
        </p>
      )}
    </div>
  );
}
