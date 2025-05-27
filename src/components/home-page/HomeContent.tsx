import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { WelcomeBanner } from './WelcomeBanner';
import { useContacts } from '@/hooks/use-contacts';
import { DashboardStats } from './DashboardStats';
import UnifiedNetworkRecommendations from '../home/UnifiedNetworkRecommendations';
import AIRelationshipDashboard from '../ai/AIRelationshipDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileHeader from './MobileHeader';
import HomeActionBar from './HomeActionBar';
import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import ContactForm from '../contact/ContactForm';
import KeystoneForm from '../keystone/KeystoneForm';
import UnifiedTimeline from './UnifiedTimeline';

const HomeContent: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { 
    contacts, 
    isLoading, 
    followUpStats, 
    getContactDistribution
  } = useContacts();
  
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isAddKeystoneDialogOpen, setIsAddKeystoneDialogOpen] = useState(false);
  
  const handleAddContact = () => {
    setIsAddContactDialogOpen(true);
  };
  
  const handleAddKeystone = () => {
    setIsAddKeystoneDialogOpen(true);
  };

  const contactStatsData = {
    totalContacts: contacts.length,
    distribution: getContactDistribution(),
    followUpStats: followUpStats
  };
  
  const handleViewAllContacts = () => {
    navigate('/circles');
  };
  
  const handleContactFormSuccess = () => {
    setIsAddContactDialogOpen(false);
  };
  
  const handleKeystoneFormSuccess = () => {
    setIsAddKeystoneDialogOpen(false);
  };
  
  const contactFormContent = (
    <ContactForm 
      onSuccess={handleContactFormSuccess} 
      onCancel={() => setIsAddContactDialogOpen(false)}
    />
  );
  
  const keystoneFormContent = (
    <KeystoneForm 
      onSuccess={handleKeystoneFormSuccess}
      onCancel={() => setIsAddKeystoneDialogOpen(false)}
    />
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* We'll keep the mobile header for mobile devices only */}
      {isMobile && <MobileHeader />}
      
      {/* Action bar at the top */}
      {!isMobile && <HomeActionBar />}
      
      <WelcomeBanner onAddContact={handleAddContact} />
      
      {/* Main dashboard stats */}
      <DashboardStats 
        totalContacts={contactStatsData.totalContacts}
        distribution={contactStatsData.distribution}
        followUpStats={contactStatsData.followUpStats}
        isLoading={isLoading}
      />
      
      {/* AI Relationship Assistant - Featured prominently */}
      <AIRelationshipDashboard contacts={contacts} />
      
      {/* Main content area with responsive layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main column - 2/3 width on desktop */}
        <div className="md:col-span-2 space-y-6">
          {/* Unified Timeline replacing Recent Contacts and Upcoming Keystones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xl font-medium">Timeline</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddKeystone}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Event
                </Button>
                <Button variant="ghost" size="sm" onClick={handleViewAllContacts}>
                  View All <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UnifiedTimeline />
            </CardContent>
          </Card>
        </div>
        
        {/* Side column - 1/3 width on desktop */}
        <div className="space-y-6">
          {/* Unified Network Recommendations - replaces both AI Insights and Network Recommendations */}
          <UnifiedNetworkRecommendations contacts={contacts} />
        </div>
      </div>
      
      {/* Add Contact Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6">
            <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
            <SheetHeader className="mb-4">
              <SheetTitle>Add Contact</SheetTitle>
              <SheetDescription>
                Add a new contact to your network
              </SheetDescription>
            </SheetHeader>
            {contactFormContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            {contactFormContent}
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add Keystone Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={isAddKeystoneDialogOpen} onOpenChange={setIsAddKeystoneDialogOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6">
            <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
            <SheetHeader className="mb-4">
              <SheetTitle>Add Keystone</SheetTitle>
              <SheetDescription>
                Add a new important date or event
              </SheetDescription>
            </SheetHeader>
            {keystoneFormContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isAddKeystoneDialogOpen} onOpenChange={setIsAddKeystoneDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            {keystoneFormContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HomeContent;
