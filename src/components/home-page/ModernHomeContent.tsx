
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContacts } from '@/hooks/use-contacts';
import { useKeystones } from '@/hooks/use-keystones';
import { useActionSearch } from '@/hooks/use-action-search';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { ActionSearchBar } from '@/components/ui/action-search-bar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { GradientText } from '../ui/gradient-text';
import { ArrowRight, Plus, Users, Atom, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import ContactForm from '../contact/ContactForm';
import KeystoneForm from '../keystone/KeystoneForm';
import EnhancedNetworkRecommendations from '../home/EnhancedNetworkRecommendations';
import { KeystoneDetailDialog } from '../keystone/KeystoneDetailDialog';
import type { Keystone } from '@/types/keystone';

const ModernHomeContent: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const {
    contacts,
    isLoading,
    followUpStats
  } = useContacts();
  const { keystones } = useKeystones();
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isAddKeystoneDialogOpen, setIsAddKeystoneDialogOpen] = useState(false);
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [isKeystoneDetailOpen, setIsKeystoneDetailOpen] = useState(false);

  // Debug logging for component render
  console.log('[ModernHomeContent] Render - contacts:', contacts?.length, 'keystones:', keystones?.length);

  const handleAddContact = () => setIsAddContactDialogOpen(true);
  const handleAddKeystone = () => setIsAddKeystoneDialogOpen(true);
  const handleAddInteraction = () => {
    // For now, navigate to circles where they can select a contact
    navigate('/circles');
  };

  const handleKeystoneSelect = useCallback((keystone: Keystone) => {
    console.log('[ModernHomeContent] Keystone selected:', keystone.title);
    setSelectedKeystone(keystone);
    setIsKeystoneDetailOpen(true);
  }, []);

  const { actions } = useActionSearch({
    onAddContact: handleAddContact,
    onAddKeystone: handleAddKeystone,
    onAddInteraction: handleAddInteraction,
  });

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    onAddContact: handleAddContact,
    onAddKeystone: handleAddKeystone,
    onAddInteraction: handleAddInteraction,
  });

  const handleContactFormSuccess = () => {
    setIsAddContactDialogOpen(false);
  };

  const handleKeystoneFormSuccess = () => {
    setIsAddKeystoneDialogOpen(false);
  };

  const stats = [{
    title: "Total Contacts",
    value: contacts.length,
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50/50 dark:bg-blue-900/20"
  }, {
    title: "Inner Circle",
    value: contacts.filter(c => c.circle === 'inner').length,
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50/50 dark:bg-green-900/20"
  }, {
    title: "Follow-ups Due",
    value: followUpStats?.due || 0,
    icon: Calendar,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50/50 dark:bg-orange-900/20"
  }];

  const contactFormContent = <ContactForm onSuccess={handleContactFormSuccess} onCancel={() => setIsAddContactDialogOpen(false)} />;
  const keystoneFormContent = <KeystoneForm onSuccess={handleKeystoneFormSuccess} onCancel={() => setIsAddKeystoneDialogOpen(false)} />;

  return (
    <div className="min-h-screen refined-web-theme">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex flex-col space-y-2">
          <GradientText className="text-3xl font-extrabold">
            Welcome back
          </GradientText>
          <p className="text-muted-foreground text-lg font-normal">Let's strengthen your connections today</p>
        </div>

        <div className="space-y-4">
          <ActionSearchBar 
            actions={actions}
            contacts={contacts || []}
            keystones={keystones || []}
            onKeystoneSelect={handleKeystoneSelect}
            placeholder="What would you like to do today?"
            className="max-w-2xl"
          />
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsAddContactDialogOpen(true)} 
              className="px-6 py-2 text-white bg-gradient-to-r from-[#0daeec]/90 to-[#0daeec]/70 hover:from-[#0daeec] hover:to-[#0daeec]/90 border-[#0daeec]/30 rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
            <Button 
              onClick={() => setIsAddKeystoneDialogOpen(true)} 
              variant="outline" 
              className="px-6 py-2 rounded-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card-enhanced">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor} border border-white/20 dark:border-white/10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EnhancedNetworkRecommendations contacts={contacts} />
          </div>
          
          <div className="space-y-6">
            <Card className="glass-card-enhanced">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-foreground">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/circles')} 
                  className="w-full justify-between p-4 h-auto rounded-full"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">View All Contacts</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/events')} 
                  className="w-full justify-between p-4 h-auto rounded-full"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Upcoming Events</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
                
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                  <defs>
                    <linearGradient id="atom-gradient-home" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0092ca" />
                      <stop offset="50%" stopColor="#a21caf" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/ai-assistant')} 
                  className="w-full justify-between p-4 h-auto rounded-full"
                >
                  <div className="flex items-center space-x-3">
                    <Atom className="h-5 w-5" stroke="url(#atom-gradient-home)" strokeWidth="2" />
                    <span className="font-medium text-foreground">Arlo</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      {isMobile ? (
        <>
          <Sheet open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
            <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6 glass-card-enhanced">
              <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-white/30" />
              <SheetHeader className="mb-4">
                <SheetTitle className="text-foreground">Add Contact</SheetTitle>
                <SheetDescription className="text-muted-foreground">Add a new contact to your network</SheetDescription>
              </SheetHeader>
              {contactFormContent}
            </SheetContent>
          </Sheet>
          
          <Sheet open={isAddKeystoneDialogOpen} onOpenChange={setIsAddKeystoneDialogOpen}>
            <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6 glass-card-enhanced">
              <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-white/30" />
              <SheetHeader className="mb-4">
                <SheetTitle className="text-foreground">Add Event</SheetTitle>
                <SheetDescription className="text-muted-foreground">Add a new important date or event</SheetDescription>
              </SheetHeader>
              {keystoneFormContent}
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <>
          <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
            <DialogContent className="sm:max-w-xl glass-card-enhanced border-white/20 dark:border-white/15">
              {contactFormContent}
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddKeystoneDialogOpen} onOpenChange={setIsAddKeystoneDialogOpen}>
            <DialogContent className="sm:max-w-xl glass-card-enhanced border-white/20 dark:border-white/15">
              {keystoneFormContent}
            </DialogContent>
          </Dialog>
        </>
      )}

      <KeystoneDetailDialog
        keystone={selectedKeystone}
        isOpen={isKeystoneDetailOpen}
        onClose={() => {
          setIsKeystoneDetailOpen(false);
          setSelectedKeystone(null);
        }}
      />
    </div>
  );
};

export default ModernHomeContent;
