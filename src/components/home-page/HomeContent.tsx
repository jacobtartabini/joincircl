
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { WelcomeBanner } from './WelcomeBanner';
import { ContactStats } from '../home/ContactStats';
import { RecentContacts } from '../home/RecentContacts';
import NetworkRecommendations from '../home/NetworkRecommendations';

const HomeContent: React.FC = () => {
  const isMobile = useIsMobile();
  
  const handleAddContact = () => {
    // This will be implemented when we add the functionality
    console.log('Add contact button clicked');
  };
  
  // Mock data for ContactStats
  const contactStatsData = {
    totalContacts: 42,
    distribution: {
      innerCircleCount: 5,
      middleCircleCount: 12,
      outerCircleCount: 25,
    },
    followUpStats: {
      due: 3,
      trend: { value: 2, isPositive: false },
    }
  };
  
  // Mock data for RecentContacts
  const recentContactsProps = {
    contacts: [],
    isLoading: false,
    onContactChange: () => console.log('Contact changed'),
    onAddContact: handleAddContact
  };
  
  return (
    <div className="space-y-6">
      <WelcomeBanner onAddContact={handleAddContact} />
      
      {/* Stats cards with better mobile layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Network</h2>
        <ContactStats 
          totalContacts={contactStatsData.totalContacts}
          distribution={contactStatsData.distribution}
          followUpStats={contactStatsData.followUpStats}
        />
      </div>
      
      {/* Recent contacts section */}
      <div className={`mt-8 ${isMobile ? 'space-y-6' : 'grid grid-cols-2 gap-6'}`}>
        <div className="space-y-4">
          <RecentContacts 
            contacts={recentContactsProps.contacts}
            isLoading={recentContactsProps.isLoading}
            onContactChange={recentContactsProps.onContactChange}
            onAddContact={recentContactsProps.onAddContact}
          />
        </div>
        
        <div className="space-y-4">
          <NetworkRecommendations />
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
