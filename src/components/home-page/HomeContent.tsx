
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import WelcomeBanner from './WelcomeBanner';
import ContactStats from '../home/ContactStats';
import RecentContacts from '../home/RecentContacts';
import NetworkRecommendations from '../home/NetworkRecommendations';

const HomeContent: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      
      {/* Stats cards with better mobile layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Network</h2>
        <ContactStats />
      </div>
      
      {/* Recent contacts section */}
      <div className={`mt-8 ${isMobile ? 'space-y-6' : 'grid grid-cols-2 gap-6'}`}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Contacts</h2>
          <RecentContacts />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recommendations</h2>
          <NetworkRecommendations />
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
