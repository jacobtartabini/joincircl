
import { useState, useMemo } from "react";
import { useCirclesState } from "./hooks/useCirclesState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  Building2, 
  MapPin,
  MoreHorizontal,
  Mail,
  Phone
} from "lucide-react";
import { Contact } from "@/types/contact";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ContactForm from "@/components/contact/ContactForm";
import { useIsMobile } from "@/hooks/use-mobile";

const ModernCircles = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    contacts,
    isLoading,
    searchQuery,
    setSearchQuery,
    isAddDialogOpen,
    setIsAddDialogOpen,
    fetchContacts
  } = useCirclesState();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    
    let filtered = contacts;
    
    // Filter by circle
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(contact => contact.circle === selectedFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name?.toLowerCase().includes(query) ||
        contact.company_name?.toLowerCase().includes(query) ||
        contact.job_title?.toLowerCase().includes(query) ||
        contact.personal_email?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [contacts, selectedFilter, searchQuery]);

  const getCircleColor = (circle: string) => {
    switch (circle) {
      case 'inner': return 'bg-green-100 text-green-800 border-green-200';
      case 'middle': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'outer': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleContactClick = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };

  const contactFormContent = (
    <ContactForm 
      onSuccess={() => {
        setIsAddDialogOpen(false);
        fetchContacts();
      }} 
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
              <h1 className="text-3xl font-light text-gray-900">Your Network</h1>
              <p className="text-gray-600 text-lg font-light mt-1">
                {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
              </p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-full px-6 py-2 bg-black text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search contacts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 rounded-full"
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'inner', 'middle', 'outer'].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-full px-4 py-2 ${
                    selectedFilter === filter 
                      ? 'bg-black text-white' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Contacts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <Card 
                key={contact.id} 
                className="border-0 shadow-sm bg-white hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleContactClick(contact)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Contact Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contact.avatar_url} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                            {contact.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {contact.name}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCircleColor(contact.circle)}`}
                          >
                            {contact.circle}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-2 text-sm text-gray-600">
                      {contact.job_title && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="truncate">
                            {contact.job_title}
                            {contact.company_name && ` at ${contact.company_name}`}
                          </span>
                        </div>
                      )}
                      
                      {contact.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{contact.location}</span>
                        </div>
                      )}
                      
                      {contact.personal_email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{contact.personal_email}</span>
                        </div>
                      )}
                      
                      {contact.mobile_phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{contact.mobile_phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Last Contact */}
                    {contact.last_contact && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Last contact: {new Date(contact.last_contact).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'Start building your network by adding your first contact'}
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="rounded-full px-6 py-2 bg-black text-white hover:bg-gray-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Contact Dialog */}
      {isMobile ? (
        <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6">
            <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
            <SheetHeader className="mb-4">
              <SheetTitle>Add Contact</SheetTitle>
            </SheetHeader>
            {contactFormContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            {contactFormContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ModernCircles;
