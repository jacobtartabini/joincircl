
import { useContacts } from '@/hooks/use-contacts';
import { DashboardStats } from './DashboardStats';
import { RecentContacts } from '@/components/home/RecentContacts';
import UnifiedNetworkRecommendations from '@/components/home/UnifiedNetworkRecommendations';
import { EnhancedNetworkAnalysis } from '@/components/home/EnhancedNetworkAnalysis';
import { HomePageHeader } from './HomePageHeader';

export default function MobileHomeContent() {
  const { 
    contacts, 
    totalContactCount, // Use the accurate total count
    isLoading, 
    followUpStats, 
    getContactDistribution, 
    getRecentContacts 
  } = useContacts();

  const distribution = getContactDistribution();
  const recentContacts = getRecentContacts(3);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <HomePageHeader />
        
        <DashboardStats 
          totalContacts={totalContactCount} // Use server-provided total count
          distribution={distribution}
          followUpStats={followUpStats}
          isLoading={isLoading}
        />
        
        <div className="space-y-6">
          <EnhancedNetworkAnalysis contacts={contacts} isLoading={isLoading} />
          <UnifiedNetworkRecommendations contacts={contacts} />
          <RecentContacts contacts={recentContacts} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
