
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContacts } from '@/hooks/use-contacts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, Plus, Users, Brain, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import ContactForm from '../contact/ContactForm';
import KeystoneForm from '../keystone/KeystoneForm';
import EnhancedNetworkRecommendations from '../home/EnhancedNetworkRecommendations';

const ModernHomeContent: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { contacts, isLoading, followUpStats } = useContacts();
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isAddKeystoneDialogOpen, setIsAddKeystoneDialogOpen] = useState(false);

  const handleAddContact = () => {
    setIsAddContactDialogOpen(true);
  };

  const handleAddKeystone = () => {
    setIsAddKeystoneDialogOpen(true);
  };

  const handleContactFormSuccess = () => {
    setIsAddContactDialogOpen(false);
  };

  const handleKeystoneFormSuccess = () => {
    setIsAddKeystoneDialogOpen(false);
  };

  const stats = [
    {
      title: "Total Contacts",
      value: contacts.length,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Inner Circle",
      value: contacts.filter(c => c.circle === 'inner').length,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Follow-ups Due",
      value: followUpStats?.due || 0,
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

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
    <div className="min-h-screen unified-web-theme">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl text-foreground font-extrabold">Welcome back</h1>
          <p className="text-muted-foreground text-lg font-normal">Let's strengthen your connections today</p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleAddContact} 
            className="unified-button rounded-full px-6 py-2 text-white transition-colors bg-[#0daeec] hover:bg-[#0daeec]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
          <Button 
            onClick={handleAddKeystone} 
            variant="outline" 
            className="unified-button rounded-full px-6 py-2 border-border hover:bg-accent transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="unified-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Network Recommendations - Takes 2 columns */}
          <div className="lg:col-span-2">
            <EnhancedNetworkRecommendations contacts={contacts} />
          </div>
          
          {/* Quick Navigation */}
          <div className="space-y-6">
            <Card className="unified-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-foreground">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/circles')} 
                  className="unified-button w-full justify-between p-4 h-auto hover:bg-accent rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">View All Contacts</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/keystones')} 
                  className="unified-button w-full justify-between p-4 h-auto hover:bg-accent rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Upcoming Events</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/ai-assistant')} 
                  className="unified-button w-full justify-between p-4 h-auto hover:bg-accent rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">AI Assistant</span>
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
            <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6 bg-background">
              <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
              <SheetHeader className="mb-4">
                <SheetTitle className="text-foreground">Add Contact</SheetTitle>
                <SheetDescription className="text-muted-foreground">Add a new contact to your network</SheetDescription>
              </SheetHeader>
              {contactFormContent}
            </SheetContent>
          </Sheet>
          
          <Sheet open={isAddKeystoneDialogOpen} onOpenChange={setIsAddKeystoneDialogOpen}>
            <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6 bg-background">
              <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
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
            <DialogContent className="sm:max-w-xl bg-background border-border">
              {contactFormContent}
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddKeystoneDialogOpen} onOpenChange={setIsAddKeystoneDialogOpen}>
            <DialogContent className="sm:max-w-xl bg-background border-border">
              {keystoneFormContent}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default ModernHomeContent;
