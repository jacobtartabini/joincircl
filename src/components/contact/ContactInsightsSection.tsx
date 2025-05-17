
import { ConnectionStrength } from "@/types/contact";
import ConnectionInsights from "@/components/contact/ConnectionInsights";

interface ContactInsightsSectionProps {
  contactId: string;
  connectionStrength?: ConnectionStrength;
}

export default function ContactInsightsSection({ contactId, connectionStrength }: ContactInsightsSectionProps) {
  if (!connectionStrength) return null;
  
  return <ConnectionInsights strength={connectionStrength} />;
}
