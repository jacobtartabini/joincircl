
import { ConnectionStrength } from "@/types/contact";
import ContactInsightsSection from "@/components/contact/ContactInsightsSection";

interface ContactDetailRightColumnProps {
  connectionStrength?: ConnectionStrength;
}

export default function ContactDetailRightColumn({
  connectionStrength
}: ContactDetailRightColumnProps) {
  return (
    <div>
      <ContactInsightsSection connectionStrength={connectionStrength} />
    </div>
  );
}
