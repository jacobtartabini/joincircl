import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { ContactCard } from "@/components/ui/contact-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import InteractionForm from "@/components/interaction/InteractionForm";
import { Plus, Filter } from "lucide-react";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { calculateConnectionStrength } from "@/utils/connectionStrength";
import { SearchBar, MultiSelect, FilterOption } from "@/components/ui/search-filter";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

const Circles = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // New search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<FilterOption[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactService.getContacts();
      setContacts(data);
      
      // Extract unique tags from all contacts
      const allTags = new Set<string>();
      data.forEach(contact => {
        if (contact.tags && Array.isArray(contact.tags)) {
          contact.tags.forEach(tag => allTags.add(tag));
        }
      });
      
      setAvailableTags(
        Array.from(allTags).map(tag => ({ value: tag, label: tag }))
      );
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleAddInteraction = (contact: Contact) => {
    setSelectedContact(contact);
    setIsInteractionDialogOpen(true);
  };

  const handleViewInsights = (contact: Contact) => {
    setSelectedContact(contact);
    setIsInsightsDialogOpen(true);
  };

  const handleViewContact = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };

  const handleDialogSuccess = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsInteractionDialogOpen(false);
    setSelectedContact(null);
    fetchContacts();
  };

  // Filter contacts based on search query and tags
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Check if contact matches search query
      const matchesSearch = searchQuery === "" || 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.personal_email && contact.personal_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.mobile_phone && contact.mobile_phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.company_name && contact.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.job_title && contact.job_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.notes && contact.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Check if contact has all selected tags
      const matchesTags = selectedTags.length === 0 || 
        (contact.tags && selectedTags.every(tag => contact.tags?.includes(tag)));
      
      return matchesSearch && matchesTags;
    });
  }, [contacts, searchQuery, selectedTags]);

  // Group filtered contacts by circle
  const allContacts = filteredContacts;
  const innerCircleContacts = filteredContacts.filter(c => c.circle === "inner");
  const middleCircleContacts = filteredContacts.filter(c => c.circle === "middle");
  const outerCircleContacts = filteredContacts.filter(c => c.circle === "outer");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Circles</h1>
          <p className="text-muted-foreground">
            Organize your network in concentric circles of connection
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-1" /> Add Contact
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search contacts..." 
        />
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2 items-center">
              <Filter size={16} />
              <span className="hidden md:inline">Filters</span>
              {selectedTags.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {selectedTags.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter by tags</h4>
              <MultiSelect
                options={availableTags}
                selected={selectedTags}
                onChange={setSelectedTags}
                placeholder="Select tags..."
              />
              {selectedTags.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTags([])} 
                  className="text-sm text-muted-foreground"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="inner">Inner Circle</TabsTrigger>
          <TabsTrigger value="middle">Middle Circle</TabsTrigger>
          <TabsTrigger value="outer">Outer Circle</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : allContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddNote={() => handleAddInteraction(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleViewContact(contact)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              {searchQuery || selectedTags.length > 0 ? (
                <p className="text-muted-foreground">No contacts match your search criteria.</p>
              ) : (
                <>
                  <p className="text-muted-foreground">No contacts yet.</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    Add your first contact
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Similar updates for the other tabs, just changing the data source */}
        <TabsContent value="inner" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : innerCircleContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {innerCircleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddNote={() => handleAddInteraction(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleViewContact(contact)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              {searchQuery || selectedTags.length > 0 ? (
                <p className="text-muted-foreground">No inner circle contacts match your search criteria.</p>
              ) : (
                <>
                  <p className="text-muted-foreground">No inner circle contacts yet.</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    Add your first contact
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="middle" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : middleCircleContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {middleCircleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddNote={() => handleAddInteraction(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleViewContact(contact)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              {searchQuery || selectedTags.length > 0 ? (
                <p className="text-muted-foreground">No middle circle contacts match your search criteria.</p>
              ) : (
                <>
                  <p className="text-muted-foreground">No middle circle contacts yet.</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    Add your first contact
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outer" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : outerCircleContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outerCircleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddNote={() => handleAddInteraction(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleViewContact(contact)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              {searchQuery || selectedTags.length > 0 ? (
                <p className="text-muted-foreground">No outer circle contacts match your search criteria.</p>
              ) : (
                <>
                  <p className="text-muted-foreground">No outer circle contacts yet.</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    Add your first contact
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSuccess={handleDialogSuccess}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <ContactForm
              contact={selectedContact}
              onSuccess={handleDialogSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedContact(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isInteractionDialogOpen} onOpenChange={setIsInteractionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedContact ? `Log Interaction with ${selectedContact.name}` : 'Log Interaction'}
            </DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <InteractionForm
              contact={selectedContact}
              onSuccess={handleDialogSuccess}
              onCancel={() => {
                setIsInteractionDialogOpen(false);
                setSelectedContact(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connection Insights</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <ConnectionInsights 
              strength={
                selectedContact.connection_strength || 
                calculateConnectionStrength(selectedContact)
              } 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Circles;
