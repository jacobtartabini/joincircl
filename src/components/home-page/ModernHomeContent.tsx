
import { useContacts } from '@/hooks/use-contacts';
import { DashboardStats } from './DashboardStats';
import { RecentContacts } from '@/components/home/RecentContacts';
import UnifiedNetworkRecommendations from '@/components/home/UnifiedNetworkRecommendations';
import { EnhancedNetworkAnalysis } from '@/components/home/EnhancedNetworkAnalysis';
import { HomePageHeader } from './HomePageHeader';

export default function ModernHomeContent() {
  const { 
    contacts, 
    totalContactCount, // Use the accurate total count
    isLoading, 
    followUpStats, 
    getContactDistribution, 
    getRecentContacts 
  } = useContacts();

  const distribution = getContactDistribution();
  const recentContacts = getRecentContacts(4);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        <HomePageHeader />
        
        <DashboardStats 
          totalContacts={totalContactCount} // Use server-provided total count
          distribution={distribution}
          followUpStats={followUpStats}
          isLoading={isLoading}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <UnifiedNetworkRecommendations contacts={contacts} />
            <RecentContacts contacts={recentContacts} isLoading={isLoading} />
          </div>
          
          <div className="space-y-6">
            <EnhancedNetworkAnalysis contacts={contacts} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
