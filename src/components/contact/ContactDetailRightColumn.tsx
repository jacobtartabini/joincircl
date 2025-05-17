
import { ConnectionStrength } from "@/types/contact";
import ContactInsightsSection from "@/components/contact/ContactInsightsSection";

interface ContactDetailRightColumnProps {
  connectionStrength?: ConnectionStrength;
  contactId: string;  // Add the contactId prop
}

export default function ContactDetailRightColumn({
  connectionStrength,
  contactId  // Destructure the contactId prop
}: ContactDetailRightColumnProps) {
  return (
    <div>
      <ContactInsightsSection connectionStrength={connectionStrength} contactId={contactId} />
    </div>
  );
}
