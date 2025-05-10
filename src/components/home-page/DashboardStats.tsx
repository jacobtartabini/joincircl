
import React from 'react';
import { StatsCard } from "@/components/ui/stats-card";
import { useIsMobile } from '@/hooks/use-mobile';
import { Users, Circle, Clock } from 'lucide-react';

interface DashboardStatsProps {
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
  isLoading: boolean;
}

export function DashboardStats({ 
  totalContacts, 
  distribution, 
  followUpStats, 
  isLoading 
}: DashboardStatsProps) {
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        title="Total Contacts"
        value={totalContacts}
        description="All your connections"
        icon={<Users className="h-4 w-4" />}
        className="hover-scale"
      />
      <StatsCard
        title="Circle Distribution"
        value={`${distribution.innerCircleCount}/${distribution.middleCircleCount}/${distribution.outerCircleCount}`}
        description="Inner/Middle/Outer"
        icon={<Circle className="h-4 w-4" />}
        className="hover-scale"
      />
      <StatsCard
        title="Follow-ups Due"
        value={String(followUpStats.due)}
        description="Based on contact frequency"
        trend={followUpStats.due > 0 ? followUpStats.trend : undefined}
        icon={<Clock className="h-4 w-4" />}
        className="hover-scale"
      />
    </div>
  );
}
