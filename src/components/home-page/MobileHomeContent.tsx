
import { useContacts } from '@/hooks/use-contacts';
import { DashboardStats } from './DashboardStats';
import { RecentContacts } from '@/components/home/RecentContacts';
import UnifiedNetworkRecommendations from '@/components/home/UnifiedNetworkRecommendations';
import { EnhancedNetworkAnalysis } from '@/components/home/EnhancedNetworkAnalysis';
import { HomePageHeader } from './HomePageHeader';
import { useNavigate } from 'react-router-dom';

export default function MobileHomeContent() {
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
  const recentContacts = getRecentContacts(3);

  const handleContactChange = () => {
    fetchContacts();
  };

  const handleAddContact = () => {
    navigate('/contacts/new');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <HomePageHeader />
        
        <DashboardStats 
          totalContacts={totalContactCount}
          distribution={distribution}
          followUpStats={followUpStats}
          isLoading={isLoading}
        />
        
        <div className="space-y-6">
          <EnhancedNetworkAnalysis contacts={contacts} isLoading={isLoading} />
          <UnifiedNetworkRecommendations contacts={contacts} />
          <RecentContacts 
            contacts={recentContacts} 
            isLoading={isLoading}
            onContactChange={handleContactChange}
            onAddContact={handleAddContact}
          />
        </div>
      </div>
    </div>
  );
}
