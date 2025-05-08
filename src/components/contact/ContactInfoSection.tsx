
import { Contact } from "@/types/contact";
import ContactInfo from "@/components/contact/ContactInfo";

interface ContactInfoSectionProps {
  contact: Contact;
}

export default function ContactInfoSection({ contact }: ContactInfoSectionProps) {
  return <ContactInfo contact={contact} />;
}
