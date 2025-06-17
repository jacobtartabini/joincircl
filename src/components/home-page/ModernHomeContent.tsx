
import { useContacts } from '@/hooks/use-contacts';
import { DashboardStats } from './DashboardStats';
import { RecentContacts } from '@/components/home/RecentContacts';
import UnifiedNetworkRecommendations from '@/components/home/UnifiedNetworkRecommendations';
import { EnhancedNetworkAnalysis } from '@/components/home/EnhancedNetworkAnalysis';
import { HomePageHeader } from './HomePageHeader';
import { useNavigate } from 'react-router-dom';

export default function ModernHomeContent() {
  const { 
    contacts, 
    totalContactCount,
    isLoading, 
    followUpStats, 
    getContactDistribution, 
    getRecentContacts,
    fetchContacts
  } = useContacts();
  
  const navigate = useNavigate();

  const distribution = getContactDistribution();
  const recentContacts = getRecentContacts(4);

  const handleContactChange = () => {
    fetchContacts();
  };

  const handleAddContact = () => {
    navigate('/contacts/new');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        <HomePageHeader />
        
        <DashboardStats 
          totalContacts={totalContactCount}
          distribution={distribution}
          followUpStats={followUpStats}
          isLoading={isLoading}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <UnifiedNetworkRecommendations contacts={contacts} />
            <RecentContacts 
              contacts={recentContacts} 
              isLoading={isLoading}
              onContactChange={handleContactChange}
              onAddContact={handleAddContact}
            />
          </div>
          
          <div className="space-y-6">
            <EnhancedNetworkAnalysis contacts={contacts} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
