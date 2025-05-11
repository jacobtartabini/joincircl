import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { WelcomeBanner } from './WelcomeBanner';
import { useContacts } from '@/hooks/use-contacts';
import { DashboardStats } from './DashboardStats';
import { RecentContacts } from '../home/RecentContacts';
import NetworkRecommendations from '../home/NetworkRecommendations';
import { UpcomingKeystones } from './UpcomingKeystones';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CalendarDays, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileHeader from './MobileHeader';

const HomeContent: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { 
    contacts, 
    isLoading, 
    followUpStats, 
    getContactDistribution, 
    getRecentContacts 
  } = useContacts();
  
  const handleAddContact = () => {
    navigate('/circles', { state: { openAddContact: true } });
  };
  
  const contactStatsData = {
    totalContacts: contacts.length,
    distribution: getContactDistribution(),
    followUpStats: followUpStats
  };

  const recentContacts = getRecentContacts(3);
  
  const recentContactsProps = {
    contacts: recentContacts,
    isLoading: isLoading,
    onContactChange: () => console.log('Contact changed'),
    onAddContact: handleAddContact
  };

  const handleViewAllContacts = () => {
    navigate('/circles');
  };
  
  const handleViewAllKeystones = () => {
    navigate('/keystones');
  };
  
  const handleAddKeystone = () => {
    navigate('/keystones', { state: { openAddKeystone: true } });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* We'll keep the mobile header for mobile devices only */}
      {isMobile && <MobileHeader />}
      
      <WelcomeBanner onAddContact={handleAddContact} />
      
      {/* Main dashboard stats */}
      <DashboardStats 
        totalContacts={contactStatsData.totalContacts}
        distribution={contactStatsData.distribution}
        followUpStats={contactStatsData.followUpStats}
        isLoading={isLoading}
      />
      
      {/* Main content area with responsive layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main column - 2/3 width on desktop */}
        <div className="md:col-span-2 space-y-6">
          {/* Recent Contacts Section - Removed duplicate heading */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xl font-medium">Recent Contacts</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleViewAllContacts}>
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <RecentContacts 
                contacts={recentContactsProps.contacts}
                isLoading={recentContactsProps.isLoading}
                onContactChange={recentContactsProps.onContactChange}
                onAddContact={recentContactsProps.onAddContact}
              />
            </CardContent>
          </Card>
          
          {/* Upcoming Keystones section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xl font-medium">Upcoming Keystones</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddKeystone}
                >
                  <PlusCircle size={16} className="mr-1" /> New
                </Button>
                <Button variant="ghost" size="sm" onClick={handleViewAllKeystones}>
                  <CalendarDays size={16} className="mr-1" /> View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UpcomingKeystones />
            </CardContent>
          </Card>
        </div>
        
        {/* Side column - 1/3 width on desktop */}
        <div className="space-y-6">
          {/* Network Recommendations */}
          <NetworkRecommendations />
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
