
import { Contact } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import ContactKeystones from "@/components/contact/ContactKeystones";

interface ContactKeystonesSectionProps {
  keystones: Keystone[];
  contact: Contact;
  onKeystoneAdded: () => Promise<void>;
}

export default function ContactKeystonesSection({ 
  keystones, 
  contact, 
  onKeystoneAdded 
}: ContactKeystonesSectionProps) {
  return (
    <ContactKeystones 
      keystones={keystones} 
      contact={contact} 
      onKeystoneAdded={onKeystoneAdded} 
    />
  );
}
