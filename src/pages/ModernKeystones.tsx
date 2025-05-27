
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, User, MapPin, MoreHorizontal } from "lucide-react";
import { keystoneService } from "@/services/keystoneService";
import { useToast } from "@/hooks/use-toast";
import { Keystone } from "@/types/keystone";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import KeystoneForm from "@/components/keystone/KeystoneForm";
import { contactService } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { useIsMobile } from "@/hooks/use-mobile";

const ModernKeystones = () => {
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [contacts, setContacts] = useState<{[id: string]: Contact}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'upcoming' | 'past'>('upcoming');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchKeystones();
  }, []);

  const fetchKeystones = async () => {
    try {
      setIsLoading(true);
      const data = await keystoneService.getKeystones();
      setKeystones(data);
      
      // Fetch contacts for keystone cards
      const contactIds = data
        .filter(k => k.contact_id)
        .map(k => k.contact_id) as string[];
      
      if (contactIds.length > 0) {
        const uniqueContactIds = [...new Set(contactIds)];
        await fetchContacts(uniqueContactIds);
      }
    } catch (error) {
      console.error("Error fetching keystones:", error);
      toast({
        title: "Error",
        description: "Failed to load keystones. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async (contactIds: string[]) => {
    try {
      const contactMap: {[id: string]: Contact} = {};
      
      for (const id of contactIds) {
        try {
          const contact = await contactService.getContact(id);
          contactMap[id] = contact;
        } catch (e) {
          console.error(`Failed to fetch contact with ID ${id}:`, e);
        }
      }
      
      setContacts(contactMap);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchKeystones();
    toast({
      title: "Success",
      description: "Event added successfully.",
    });
  };

  const upcomingKeystones = keystones.filter(
    (k) => new Date(k.date) >= new Date()
  );
  
  const pastKeystones = keystones.filter(
    (k) => new Date(k.date) < new Date()
  );

  const displayKeystones = selectedFilter === 'upcoming' ? upcomingKeystones : pastKeystones;

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'birthday': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'follow-up': return 'bg-green-100 text-green-800 border-green-200';
      case 'anniversary': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    
    return eventDate.toLocaleDateString();
  };

  const keystoneFormContent = (
    <KeystoneForm
      onSuccess={handleAddSuccess}
      onCancel={() => setIsAddDialogOpen(false)}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Important Events</h1>
              <p className="text-gray-600 text-lg font-light mt-1">
                Keep track of meaningful moments
              </p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-full px-6 py-2 bg-black text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'upcoming' ? "default" : "outline"}
              onClick={() => setSelectedFilter('upcoming')}
              className={`rounded-full px-6 py-2 ${
                selectedFilter === 'upcoming' 
                  ? 'bg-black text-white' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              Upcoming ({upcomingKeystones.length})
            </Button>
            <Button
              variant={selectedFilter === 'past' ? "default" : "outline"}
              onClick={() => setSelectedFilter('past')}
              className={`rounded-full px-6 py-2 ${
                selectedFilter === 'past' 
                  ? 'bg-black text-white' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              Past ({pastKeystones.length})
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayKeystones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayKeystones.map((keystone) => {
              const contactDetails = keystone.contact_id && contacts[keystone.contact_id];
              
              return (
                <Card 
                  key={keystone.id} 
                  className="border-0 shadow-sm bg-white hover:shadow-md transition-all group"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Event Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {keystone.title}
                          </h3>
                          {keystone.category && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs mt-1 ${getCategoryColor(keystone.category)}`}
                            >
                              {keystone.category}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(keystone.date)}</span>
                        </div>

                        {contactDetails && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{contactDetails.name}</span>
                          </div>
                        )}

                        {keystone.notes && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {keystone.notes}
                          </p>
                        )}
                      </div>

                      {/* Event Date Badge */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(keystone.date).toLocaleDateString()}
                          </span>
                          {selectedFilter === 'upcoming' && (
                            <Badge variant="secondary" className="text-xs">
                              {formatDate(keystone.date)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {selectedFilter} events
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedFilter === 'upcoming' 
                  ? 'Add important dates and events to stay organized' 
                  : 'No past events to display'}
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="rounded-full px-6 py-2 bg-black text-white hover:bg-gray-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Event Dialog */}
      {isMobile ? (
        <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6">
            <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
            <SheetHeader className="mb-4">
              <SheetTitle>Add Event</SheetTitle>
            </SheetHeader>
            {keystoneFormContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Add Event</DialogTitle>
            </DialogHeader>
            {keystoneFormContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ModernKeystones;
