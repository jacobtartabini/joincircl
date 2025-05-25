
import AIConnectionInsights from "@/components/ai/AIConnectionInsights";
import AIMessageGenerator from "@/components/ai/AIMessageGenerator";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { Contact, Interaction } from "@/types/contact";
import { calculateConnectionStrength } from "@/utils/connectionStrength";
import { useContactDetail } from "@/hooks/useContactDetail";

interface ContactInsightsSectionProps {
  connectionStrength?: any;
  contactId: string;
}

export default function ContactInsightsSection({
  connectionStrength,
  contactId
}: ContactInsightsSectionProps) {
  // Get the contact and interactions data for AI insights
  const { contact, interactions } = useContactDetail(contactId);

  if (!contact) {
    return null;
  }

  // Calculate connection strength if not provided
  const strength = connectionStrength || calculateConnectionStrength(contact, interactions || []);

  return (
    <div className="space-y-6">
      {/* Traditional Connection Insights */}
      <ConnectionInsights strength={strength} />
      
      {/* AI-Powered Insights */}
      <AIConnectionInsights 
        contact={contact} 
        interactions={interactions || []} 
      />
      
      {/* AI Message Generator */}
      <AIMessageGenerator contact={contact} />
    </div>
  );
}
