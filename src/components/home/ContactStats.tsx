
import { StatsCard } from "@/components/ui/stats-card";

interface ContactStatsProps {
  totalContacts: number;
  distribution: {
    innerCircleCount: number;
    middleCircleCount: number;
    outerCircleCount: number;
  };
  followUpStats: {
    due: number;
    trend: { value: number; isPositive: boolean };
  };
}

export const ContactStats = ({ 
  totalContacts, 
  distribution, 
  followUpStats 
}: ContactStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        title="Total Contacts"
        value={totalContacts}
        description="All your connections"
      />
      <StatsCard
        title="Circle Distribution"
        value={`${distribution.innerCircleCount}/${distribution.middleCircleCount}/${distribution.outerCircleCount}`}
        description="Inner/Middle/Outer"
      />
      <StatsCard
        title="Follow-ups Due"
        value={String(followUpStats.due)}
        description="Based on contact frequency"
        trend={followUpStats.due > 0 ? followUpStats.trend : undefined}
      />
    </div>
  );
};
