
import React, { useState } from 'react';
import { useContacts } from '@/hooks/use-contacts';
import { useActionSearch } from '@/hooks/use-action-search';
import { ActionSearchBar } from '@/components/ui/action-search-bar';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import ContactForm from '@/components/contact/ContactForm';
import KeystoneForm from '@/components/keystone/KeystoneForm';
import { Badge } from '@/components/ui/badge';

const MobileHomeContent: React.FC = () => {
  const navigate = useNavigate();
  const {
    contacts,
    followUpStats
  } = useContacts();
  const [isAddContactSheetOpen, setIsAddContactSheetOpen] = useState(false);
  const [isAddKeystoneSheetOpen, setIsAddKeystoneSheetOpen] = useState(false);

  const { actions } = useActionSearch({
    onAddContact: () => setIsAddContactSheetOpen(true),
    onAddKeystone: () => setIsAddKeystoneSheetOpen(true),
    onAddInteraction: () => {
      // For now, navigate to circles where they can select a contact
      navigate('/circles');
    },
  });

  const handleContactFormSuccess = () => {
    setIsAddContactSheetOpen(false);
  };

  const handleKeystoneFormSuccess = () => {
    setIsAddKeystoneSheetOpen(false);
  };

  // Quick stats for minimal display
  const stats = [{
    label: "Contacts",
    value: contacts.length,
    icon: Users,
    color: "bg-blue-50 text-blue-600"
  }, {
    label: "Follow-ups",
    value: followUpStats?.due || 0,
    icon: Calendar,
    color: "bg-orange-50 text-orange-600"
  }, {
    label: "Inner Circle",
    value: contacts.filter(c => c.circle === 'inner').length,
    icon: TrendingUp,
    color: "bg-green-50 text-green-600"
  }];

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="px-4 pt-6 pb-8 space-y-6">
        {/* Action Search Bar */}
        <div className="space-y-4">
          <ActionSearchBar 
            actions={actions}
            placeholder="What would you like to do?"
            className="w-full"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsAddContactSheetOpen(true)} 
            className="flex-1 h-12 bg-black text-white hover:bg-gray-800 font-medium rounded-full"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Contact
          </Button>
          <Button 
            onClick={() => setIsAddKeystoneSheetOpen(true)} 
            variant="outline" 
            className="flex-1 h-12 border-gray-200 hover:bg-gray-50 font-medium rounded-full"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${stat.color} mb-2`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Quick Access</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Badge 
              variant="secondary" 
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full whitespace-nowrap cursor-pointer hover:bg-gray-200 transition-colors" 
              onClick={() => navigate('/circles')}
            >
              <Users className="h-4 w-4 mr-1" />
              All Contacts
            </Badge>
            <Badge 
              variant="secondary" 
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full whitespace-nowrap cursor-pointer hover:bg-gray-200 transition-colors" 
              onClick={() => navigate('/keystones')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Upcoming Events
            </Badge>
            <Badge 
              variant="secondary" 
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full whitespace-nowrap cursor-pointer hover:bg-gray-200 transition-colors" 
              onClick={() => navigate('/circles?circle=inner')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Inner Circle
            </Badge>
          </div>
        </div>

        {/* Recent Activity Preview */}
        {followUpStats?.due > 0 && (
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-orange-900">Follow-ups Due</h4>
                <p className="text-sm text-orange-700">You have {followUpStats.due} pending follow-ups</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/circles')} 
                className="text-orange-700 hover:bg-orange-100 rounded-full"
              >
                View
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Sheet */}
      <Sheet open={isAddContactSheetOpen} onOpenChange={setIsAddContactSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6">
          <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
          <SheetHeader className="mb-4">
            <SheetTitle>Add Contact</SheetTitle>
            <SheetDescription>Add a new contact to your network</SheetDescription>
          </SheetHeader>
          <ContactForm onSuccess={handleContactFormSuccess} onCancel={() => setIsAddContactSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Add Keystone Sheet */}
      <Sheet open={isAddKeystoneSheetOpen} onOpenChange={setIsAddKeystoneSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6">
          <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
          <SheetHeader className="mb-4">
            <SheetTitle>Add Event</SheetTitle>
            <SheetDescription>Add a new important date or event</SheetDescription>
          </SheetHeader>
          <KeystoneForm onSuccess={handleKeystoneFormSuccess} onCancel={() => setIsAddKeystoneSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileHomeContent;
