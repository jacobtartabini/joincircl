
import { ConnectionStrength } from "@/types/contact";
import ConnectionInsights from "@/components/contact/ConnectionInsights";

interface ContactInsightsSectionProps {
  connectionStrength?: ConnectionStrength;
}

export default function ContactInsightsSection({ connectionStrength }: ContactInsightsSectionProps) {
  if (!connectionStrength) return null;
  
  return <ConnectionInsights strength={connectionStrength} />;
}
