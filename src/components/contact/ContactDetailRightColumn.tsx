
import { ConnectionStrength } from "@/types/contact";
import ContactInsightsSection from "@/components/contact/ContactInsightsSection";

interface ContactDetailRightColumnProps {
  connectionStrength?: ConnectionStrength;
  contactId: string;
}

export default function ContactDetailRightColumn({
  connectionStrength,
  contactId
}: ContactDetailRightColumnProps) {
  return (
    <div className="glass-card-enhanced">
      <ContactInsightsSection connectionStrength={connectionStrength} contactId={contactId} />
    </div>
  );
}
